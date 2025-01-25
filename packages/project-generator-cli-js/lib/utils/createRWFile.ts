import { execSync } from 'child_process';
import { appendFileSync, existsSync } from 'node:fs';

/**
 * Создает файл с заданным именем для чтения и записи.
 *
 * @param {string} name - Имя файла c расширением, который нужно создать.
 * @param {string | string[]} content - Контент файла.
 */
export function createRWFile(name: string, content: string | string[]): void {
  if (existsSync(name)) {
    return;
  }

  // eslint-disable-next-line no-underscore-dangle
  let _content = '';

  if (Array.isArray(content)) {
    _content = content.join('\n');
  } else {
    _content = JSON.stringify(content);
  }

  execSync(`touch ${name}`);
  execSync(`chmod uo+rw ${name}`);
  appendFileSync(name, _content, 'utf-8');
}
