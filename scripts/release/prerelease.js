#!/usr/bin/env node

// 1. prompt, какой пакет нужно публиковать ✅
// 2. Запустить тесты, если есть ✅
// 3. Собрать пакет из переданного commit sha, если есть сборка ✅
// 4. Проверить, что такой сanary-версии нет ✅
// 5. Опубликовать пакет ✅
// 6. Уведомить в боте и предрелизе ⏳

const shelljs = require('shelljs');
const path = require('node:path');
const syncVersion = require('./sync-version');
const enlistPackages = require('./enlist-packages');

async function run() {
  const response = await enlistPackages();

  const packageDirContext = shelljs.cd(response.package.packageDir);

  packageDirContext.cmd('npm', 'run', 'test', '--if-present');
  packageDirContext.cmd('npm', 'build', 'test', '--if-present');

  syncVersion({
    ...response.package,
    tag: 'canary',
  });

  const versionUpdate = packageDirContext.cmd('npm', 'version', 'prerelease', '--no-git-tag-version').stdout;
  const newVersion = versionUpdate.match(/\d+.\d.\d+(?:-\d+)?/, /$1/)[0];

  const packageVersions = shelljs.cmd('npm', 'view', response.package.packageName, 'versions').stdout;

  if (newVersion && !packageVersions.includes(newVersion)) {
    const { code: exitCode, stderr } = shelljs.cmd('npm', 'publish', '--tag', 'canary');

    shelljs.cmd('git', 'reset', '*');
    shelljs.cmd('git', 'add', path.join(response.package.packageDir, 'package.json'));
    shelljs.cmd('git', 'add', path.join(process.cwd(), 'package-lock.json'));
    shelljs.cmd('git', 'commit', '-m', `canary-релиз версии ${newVersion} пакета ${response.package.packageName}`);
    shelljs.cmd('git', 'push');

    if (exitCode === 0) {
      // eslint-disable-next-line no-console
      console.log(`Пакет ${response.package.packageName} с версией ${newVersion} опубликован`);
    } else {
      // eslint-disable-next-line no-console
      console.log(`Пакет ${response.package.packageName} с версией ${newVersion} не удалось опубликовать, попробуйте еще раз`);
      // eslint-disable-next-line no-console
      console.log('Логи публикации:');
      // eslint-disable-next-line no-console
      console.log(stderr);
      shelljs.cmd('git', 'reset', '--hard', 'HEAD~1');
    }
  } else {
    shelljs.cmd('git', 'reset', path.join(response.package.packageDir, 'package.json'));
    // eslint-disable-next-line no-console
    console.log(`Пакет ${response.package.packageName} с версией ${newVersion} уже опубликован!`);
  }
}

run();
