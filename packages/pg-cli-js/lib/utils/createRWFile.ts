/* eslint-disable consistent-return */
import async, { ErrorCallback } from 'async';
import { exec } from 'node:child_process';
import { appendFile, existsSync } from 'node:fs';

import { identity } from './identity';

/**
 * Создает файл по указанному пути и записывает в него содержимое.
 * Если файл уже существует, вызывает callback с null.
 * @internal
 *
 * @param {string} path - Путь к файлу, который нужно создать.
 * @param {string | string[]} content - Контент для записи в файл. Может быть строкой или массивом строк.
 * @param {ErrorCallback} callback - Коллбек, вызываемый после завершения операции.
 * В случае успеха вызывается с аргументом null, в случае ошибки — с объектом ошибки.
 */
export function createRWFile(
  path: string,
  content: string | string[],
  callback: ErrorCallback,
): void {
  if (existsSync(path)) {
    return callback(null);
  }

  // eslint-disable-next-line no-underscore-dangle
  let _content = '';

  if (Array.isArray(content)) {
    _content = content.join('\n');
  } else {
    _content = JSON.stringify(content);
  }

  async.waterfall([
    function createFile(innerCallback: ErrorCallback) {
      exec(`touch ${path} && chmod uo+rw ${path}`, identity(innerCallback));
    },
    // eslint-disable-next-line @typescript-eslint/no-shadow
    function updateFile(innerCallback: ErrorCallback) {
      appendFile(path, _content, 'utf-8', identity(innerCallback));
    },
  ], identity(callback));
}
