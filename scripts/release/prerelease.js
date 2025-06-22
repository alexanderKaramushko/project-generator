#!/usr/bin/env node

// 1. prompt, какой пакет нужно публиковать
// 2. Запустить тесты, если есть
// 3. Собрать пакет из переданного commit sha, если есть сборка
// 4. Проверить, что такой сanary-версии нет
// 5. Опубликовать пакет
// 6. Уведомить в боте и предрелизе

const prompts = require('prompts');
const getPackages = require('./get-packages');

function enlistPackages() {
  const packages = getPackages();

  return prompts([
    {
      choices: packages.map(({ packageDir, packageName }) => ({
        title: packageName,
        value: packageDir,
      })),
      message: 'Выберите пакет для публикации',
      name: 'package',
      type: 'select',
    },
  ]);

}

async function run() {
  const response = await enlistPackages();

  return response;
}

run();
