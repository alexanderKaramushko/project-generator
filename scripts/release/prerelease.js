#!/usr/bin/env node
/* eslint-disable no-console */

// 1. prompt, какой пакет нужно публиковать ✅
// 2. Запустить тесты, если есть ✅
// 3. Собрать пакет из переданного commit sha, если есть сборка ✅
// 4. Проверить, что такой сanary-версии нет ✅
// 5. Опубликовать пакет ✅
// 6. Уведомить в боте и предрелизе ⏳

const shelljs = require('shelljs');
const path = require('node:path');
const syncVersion = require('./sync-version');
const { enlistPackages } = require('./enlist');
const commitRelease = require('./commit-release');

async function run() {
  const response = await enlistPackages();

  const hasChanges = !!shelljs.cmd('git', 'status', '--porcelain', response.package.packageDir).stdout;

  if (!hasChanges) {
    console.log(`Пакет ${response.package.packageName} не опубликован: изменения не найдены`);

    return;
  }

  const packageDirContext = shelljs.cd(response.package.packageDir);

  packageDirContext.cmd('npm', 'run', 'test', '--if-present');
  packageDirContext.cmd('npm', 'run', 'build', '--if-present');

  syncVersion({
    ...response.package,
    npmTag: 'canary',
  });

  const versionUpdate = packageDirContext.cmd('npm', 'version', 'prerelease', '--no-git-tag-version').stdout;
  const newVersion = versionUpdate.match(/\d+.\d+.\d+(?:-\d+)?/, /$1/)[0];

  const packageVersions = shelljs.cmd('npm', 'view', response.package.packageName, 'versions').stdout;

  if (newVersion && !packageVersions.includes(newVersion)) {
    const { code: exitCode, stderr } = shelljs.cmd('npm', 'publish', '--tag', 'canary');

    commitRelease({
      packageDir: response.package.packageDir,
      packageName: response.package.packageName,
      version: newVersion,
      versionType: 'latest',
    });

    if (exitCode === 0) {
      console.log(`Пакет ${response.package.packageName} с версией ${newVersion} опубликован`);
    } else {
      console.log(`Пакет ${response.package.packageName} с версией ${newVersion} не удалось опубликовать, попробуйте еще раз`);
      console.log('Логи публикации:');
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
