#!/usr/bin/env node
/* eslint-disable no-console */

// 1. prompt, какой пакет нужно публиковать ✅
// 2. Проверить, что для текущей релизной версии создавалась canary-версия ✅
// 3. Собрать пакет из переданного commit sha, если есть сборка ✅
// 4. Синхронизировать версии ✅
// 5. Создать релизную версию (выбор patch/minor/release) ✅
// 6. Опубликовать пакет ⏳
// 7. Сделать запись в CHANGELOG ⏳
// 8. Опубликовать новый тег ⏳
// 9. Уведомить в боте и предрелизе ⏳

const path = require('node:path');
const shelljs = require('shelljs');
const { enlistPackages, enlistVersions } = require('./enlist');
const syncVersion = require('./sync-version');

async function run() {
  const response = await enlistPackages();
  const versionType = await enlistVersions();

  try {
    const packageVersions = shelljs.cmd('npm', 'view', response.package.packageName, 'versions');

    const versions = JSON.parse(packageVersions.stdout.replaceAll('\'', '"').trim());
    const lastVersion = versions.at(-1);

    if (!/\d+.\d+.\d+-\d+/.test(lastVersion)) {
      console.log(`Версия ${lastVersion} пакета ${response.package.packageName} не является предрелизной!`);
      console.log('Создайте предрелизную версию через run run canary-release.');

      return;
    }

    const packageDirContext = shelljs.cd(response.package.packageDir);

    packageDirContext.cmd('npm', 'run', 'build', '--if-present');

    syncVersion({
      ...response.package,
      npmTag: 'latest',
    });

    const versionUpdate = packageDirContext.cmd('npm', 'version', versionType.version, '--no-git-tag-version').stdout;
    const newVersion = versionUpdate.match(/\d+.\d+.\d+/, /$1/)[0];

    if (newVersion && !versions.some((version) => version === newVersion)) {
      console.log('release');
    } else {
      shelljs.cmd('git', 'reset', path.join(response.package.packageDir, 'package.json'));
      // eslint-disable-next-line no-console
      console.log(`Пакет ${response.package.packageName} с версией ${newVersion} уже опубликован!`);
    }
  } catch (error) {
    console.log(`Ошибка парсинга версий: ${error.message}`);
  }
}

run();
