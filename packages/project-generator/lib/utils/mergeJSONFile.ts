import merge from 'lodash.merge';
import { readFileSync, writeFileSync } from 'node:fs';

/**
 * Объединяет содержимое JSON-файла с переданными данными и записывает результат обратно в файл.
 *
 * Эта функция читает содержимое JSON-файла с заданным именем, объединяет его с
 * переданными данными, а затем записывает объединенное содержимое обратно в тот же файл.
 *
 * @param {string} name - Имя файла, который нужно объединить.
 * @param {Record<string, any>} mergedContent - Данные, которые будут объединены с содержимым файла.
 * @throws {Error} - Если файл не может быть прочитан или записан.
 */
export function mergeJSONFile(name: string, mergedContent: Record<string, any>): void {
  const content = readFileSync(name, { encoding: 'utf8' });

  writeFileSync(name, JSON.stringify(merge(JSON.parse(content), mergedContent)));
}
