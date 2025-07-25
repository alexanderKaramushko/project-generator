#!/usr/bin/env node
/* eslint-disable no-console */

// 1. prompt, какой пакет нужно публиковать ✅
// 2. Проверить, что для текущей релизной версии создавалась canary-версия ✅
// 3. Собрать пакет из переданного commit sha, если есть сборка ✅
// 4. Синхронизировать версии ✅
// 5. Создать релизную версию (выбор patch/minor/release) ✅
// 6. Опубликовать пакет ✅
// 7. Сделать запись в CHANGELOG ⏳
// 8. Опубликовать новый тег ⏳
// 9. Уведомить в боте и предрелизе ⏳

const path = require('node:path');
const shelljs = require('shelljs');
const semver = require('semver');
const { enlistPackages, enlistVersions } = require('./enlist');
const syncVersion = require('./sync-version');
const commitRelease = require('./commit-release');

async function run() {
  const response = await enlistPackages();
  const versionType = await enlistVersions();

  try {
    const packageVersions = shelljs.cmd('npm', 'view', response.package.packageName, 'versions');
    let versions = [];

    try {
      versions = JSON.parse(packageVersions.stdout.replaceAll('\'', '"').trim());
    } catch (error) {
      versions = [packageVersions];
    }

    const tags = shelljs.cmd('npm', 'dist-tags', 'ls', response.package.packageName).split('\n')
      .filter(Boolean)
      .map((distTag) => distTag.split(':'))
      .find(([tagName]) => tagName === 'canary');

    const canaryVersion = tags ? tags[1] : null;
    const packageDirContext = shelljs.cd(response.package.packageDir);

    packageDirContext.cmd('npm', 'run', 'build', '--if-present');

    syncVersion({
      ...response.package,
      npmTag: 'latest',
    });

    const versionUpdate = packageDirContext.cmd('npm', 'version', versionType.version, '--no-git-tag-version').stdout;
    const newVersion = versionUpdate.match(/\d+.\d+.\d+/, /$1/)[0];

    if (!canaryVersion || !semver.eq(semver.inc(canaryVersion, versionType.version), newVersion)) {
      if (canaryVersion) {
        console.log(`Версия ${canaryVersion} пакета ${response.package.packageName} не является предрелизной!`);
      } else {
        console.log(`В пакете ${response.package.packageName} отсутствует предрелизная версия`);
      }

      console.log('Создайте предрелизную версию через run run canary-release.');

      return;
    }

    if (newVersion && !versions.some((version) => version === newVersion)) {
      const { code: latestExitCode, stderr: latestStderr } = shelljs.cmd('npm', 'publish', '--tag', 'latest');
      const { code: canaryExitCode, stderr: canaryStderr } = shelljs.cmd('npm', 'publish', '--tag', 'canary');

      commitRelease({
        packageDir: response.package.packageDir,
        packageName: response.package.packageName,
        version: newVersion,
        versionType: versionType.version,
      });

      if (latestExitCode === 0 && canaryExitCode === 0) {
        // eslint-disable-next-line no-console
        console.log(`Пакет ${response.package.packageName} с версией ${newVersion} опубликован`);
      } else {
        // eslint-disable-next-line no-console
        console.log(`Пакет ${response.package.packageName} с версией ${newVersion} не удалось опубликовать, попробуйте еще раз`);
        // eslint-disable-next-line no-console
        console.log('Логи публикации:');
        // eslint-disable-next-line no-console
        console.log(latestStderr || canaryStderr);
        shelljs.cmd('git', 'reset', '--hard', 'HEAD~1');
      }
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
