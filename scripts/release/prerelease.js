#!/usr/bin/env node

// 1. prompt, какой пакет нужно публиковать ✅
// 2. Запустить тесты, если есть ✅
// 3. Собрать пакет из переданного commit sha, если есть сборка ✅
// 4. Проверить, что такой сanary-версии нет ✅
// 5. Опубликовать пакет ✅
// 6. Уведомить в боте и предрелизе ⏳

const prompts = require('prompts');
const shelljs = require('shelljs');
const path = require('node:path');
const getPackages = require('./get-packages');
const syncVersion = require('./sync-version');

function enlistPackages() {
  const packages = getPackages();

  return prompts([
    {
      choices: packages.map(({ packageDir, packageName }) => ({
        title: packageName,
        value: {
          packageDir,
          packageName,
        },
      })),
      message: 'Выберите пакет для публикации',
      name: 'package',
      type: 'select',
    },
  ]);

}

async function run() {
  const response = await enlistPackages();

  const packageDirContext = shelljs.cd(response.package.packageDir);

  packageDirContext.cmd('npm', 'run', 'test', '--if-present');
  packageDirContext.cmd('npm', 'build', 'test', '--if-present');

  syncVersion({
    ...response.package,
    tag: 'canary',
  });

  const newVersion = packageDirContext.cmd('npm', 'version', 'prerelease', '--no-git-tag-version').stdout.trim();

  // eslint-disable-next-line import/no-dynamic-require, global-require
  const packageJSON = require(path.join(response.package.packageDir, 'package.json'));
  const packageVersions = shelljs.cmd('npm', 'view', response.package.packageName, 'versions').stdout;

  if (!packageVersions.includes(newVersion)) {
    const { code: exitCode } = shelljs.cmd('npm', 'publish', '--tag', 'canary');

    if (exitCode === 0) {
      shelljs.cmd('git', 'reset', '*');
      shelljs.cmd('git', 'add', path.join(response.package.packageDir, 'package.json'));
      shelljs.cmd('git', 'add', path.join(process.cwd(), 'package-lock.json'));
      shelljs.cmd('git', 'commit', '-m', `canary-релиз версии ${newVersion} пакета ${response.package.packageName}`);
      shelljs.cmd('git', 'push');

      // eslint-disable-next-line no-console
      console.log(`Пакет ${response.package.packageName} с версией ${newVersion} опубликован`);
    } else {
      // eslint-disable-next-line no-console
      console.log(`Пакет ${response.package.packageName} не удалось опубликовать, попробуйте еще раз`);
    }
  } else {
    shelljs.cmd('git', 'reset', packageJSON);
    shelljs.cmd('git', 'reset', path.join(response.package.packageDir, 'package.json'));
    // eslint-disable-next-line no-console
    console.log(`Пакет ${response.package.packageName} с версией ${newVersion} уже опубликован!`);
  }
}

run();
