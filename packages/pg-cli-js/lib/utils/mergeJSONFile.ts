import { ErrorCallback } from 'async';
import merge from 'lodash.merge';
import { readFileSync, writeFile } from 'node:fs';

import { identity } from './identity';

/**
 * Объединяет содержимое JSON-файла с переданными данными и записывает результат обратно в файл.
 * @internal
 *
 * Эта функция читает содержимое JSON-файла с заданным именем, объединяет его с
 * переданными данными, а затем записывает объединенное содержимое обратно в тот же файл.
 *
 * @param {string} name - Имя файла, который нужно объединить.
 * @param {Record<string, any>} mergedContent - Данные, которые будут объединены с содержимым файла.
 * @param {ErrorCallback} callback - Коллбек, вызываемый после завершения операции.
 * В случае успеха вызывается с аргументом null, в случае ошибки — с объектом ошибки.
 */
export function mergeJSONFile(
  name: string,
  mergedContent: Record<string, any>,
  callback: ErrorCallback,
): void {
  const content = readFileSync(name, { encoding: 'utf8' });

  writeFile(
    name,
    JSON.stringify(
      merge(JSON.parse(content), mergedContent),
      (key, value) => value,
      2,
    ),
    identity(callback),
  );
}
