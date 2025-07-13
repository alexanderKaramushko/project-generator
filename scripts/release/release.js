#!/usr/bin/env node
/* eslint-disable no-console */

// 1. prompt, какой пакет нужно публиковать ✅
// 2. Проверить, что для текущей релизной версии создавалась canary-версия ✅
// 3. Собрать пакет из переданного commit sha, если есть сборка ⏳
// 4. Синхронизировать версии ⏳
// 5. Создать релизную версию ⏳
// 6. Опубликовать пакет ⏳
// 7. Сделать запись в CHANGELOG ⏳
// 8. Опубликовать новый тег ⏳
// 9. Уведомить в боте и предрелизе ⏳

const shelljs = require('shelljs');
const enlistPackages = require('./enlist-packages');

async function run() {
  const response = await enlistPackages();

  try {
    const versions = JSON.parse(
      shelljs.cmd('npm', 'view', response.package.packageName, 'versions').stdout.replaceAll('\'', '"'),
    );

    const lastVersion = versions.at(-1);

    if (!/\d+.\d+.\d+-\d+/.test(lastVersion)) {
      console.log(`Версия ${lastVersion} пакета ${response.package.packageName} не является предрелизной!`);
      console.log('Создайте предрелизную версию через run run canary-release.');

      return;
    }
  } catch (error) {
    console.log(`Ошибка парсинга версий: ${error.message}`);
  }
}

run();
