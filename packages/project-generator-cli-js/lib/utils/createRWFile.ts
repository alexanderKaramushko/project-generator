import { execSync } from 'child_process';
import { appendFileSync, existsSync } from 'node:fs';

/**
 * Создает файл с заданным именем для чтения и записи.
 *
 * @param {string} src - Путь до файла c расширением, который нужно создать.
 * @param {string | string[]} content - Контент файла.
 */
export function createRWFile(src: string, content: string | string[]): void {
  if (existsSync(src)) {
    return;
  }

  // eslint-disable-next-line no-underscore-dangle
  let _content = '';

  if (Array.isArray(content)) {
    _content = content.join('\n');
  } else {
    _content = JSON.stringify(content);
  }

  execSync(`touch ${src}`);
  execSync(`chmod uo+rw ${src}`);
  appendFileSync(src, _content, 'utf-8');
}
