#!/usr/bin/env node

// 1. prompt, какой пакет нужно публиковать ⏳
// 2. Проверить, что для текущей релизной версии создавалась canary-версия ⏳
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

  // const packageDirContext = shelljs.cd(response.package.packageDir);

  const result = shelljs.cmd('npm', 'view', response.package.packageName);

  console.log(result);
}

run();
