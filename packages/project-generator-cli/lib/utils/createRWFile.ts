import { execSync } from 'child_process';
import { existsSync } from 'node:fs';

/**
 * Создает файл с заданным именем для чтения и записи.
 *
 * @param {string} name - Имя файла c расширением, который нужно создать.
 */
export function createRWFile(name: string): void {
  if (existsSync(name)) {
    return;
  }

  execSync(`touch ${name}`);
  execSync(`chmod uo+rw ${name}`);
}
