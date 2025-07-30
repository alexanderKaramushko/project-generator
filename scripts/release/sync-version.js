const shelljs = require('shelljs');
const { writeFileSync } = require('node:fs');
const path = require('node:path');

/**
 * Синхронизирует локальную версию пакета с указанной версией из npm-дистрибутива по заданному тегу.
 *
 * Функция читает локальный файл `package.json` в указанной директории и обновляет его поле `version`
 * на основе версии, соответствующей заданному тегу (например, `latest`, `beta` и т.д.) из `npm dist-tags`.
 * Если тег не найден, выводит предупреждение в консоль и завершает выполнение без изменений.
 *
 * @param {Object} options - Опции синхронизации.
 * @param {string} options.packageDir - Путь к директории, содержащей файл `package.json`.
 * @param {string} options.packageName - Имя npm-пакета, версию которого нужно получить.
 * @param {string} options.tag - Тег dist-tag из npm (например, `latest`, `beta`, `next`).
 *
 * @returns {void}
 */
function syncVersion({ packageDir, packageName, npmTag }) {
  // eslint-disable-next-line import/no-dynamic-require, global-require
  const packageJSON = require(path.join(packageDir, 'package.json'));

  const foundTag = shelljs.cmd('npm', 'dist-tags', 'ls', packageName).split('\n')
    .filter(Boolean)
    .map((distTag) => distTag.split(':'))
    .find(([tagName]) => tagName === npmTag);

  if (!foundTag) {
    // eslint-disable-next-line no-console
    console.log(`Не удалось синхронизировать версию ${packageName} под тегом ${npmTag}`);
    // eslint-disable-next-line no-console
    console.log(`Возможно, ${npmTag} еще не был опубликован или пакета нет в npm`);
    return;
  }

  const [, tagVersion] = foundTag;

  packageJSON.version = tagVersion.trim();

  writeFileSync(path.join(packageDir, 'package.json'),
    JSON.stringify(
      packageJSON,
      (key, value) => value,
      2,
    ));
}

module.exports = syncVersion;
