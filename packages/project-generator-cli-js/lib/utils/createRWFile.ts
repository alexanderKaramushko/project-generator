import { execSync } from 'child_process';
import { appendFileSync, existsSync } from 'node:fs';

/**
 * Создает файл с заданным именем для чтения и записи.
 *
 * @param {string} name - Имя файла c расширением, который нужно создать.
 * @param {string} name - Контент файла.
 */
export function createRWFile(name: string, content: string = ''): void {
  if (existsSync(name)) {
    return;
  }

  execSync(`touch ${name}`);
  execSync(`chmod uo+rw ${name}`);
  appendFileSync(name, content, 'utf-8');
}
