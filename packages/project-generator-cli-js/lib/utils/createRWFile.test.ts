import { existsSync, openSync, readFileSync, rmSync } from 'node:fs';
import path from 'node:path';
// eslint-disable-next-line import/no-extraneous-dependencies
import { afterEach, describe, expect, test } from 'vitest';

import { createRWFile } from './createRWFile';

const testFile = path.resolve(__dirname, 'test.ts');

describe('createRWFile', () => {
  afterEach(() => {
    rmSync(testFile);
  });

  test('Файл успешно создается, если его нет', () => {
    createRWFile(testFile);

    expect(existsSync(testFile)).toBe(true);
  });

  test('Файл имеет правильные дескрипторы', () => {
    createRWFile(testFile);

    let fd: number | null = null;

    try {
      fd = openSync(testFile, 'w+');
    // eslint-disable-next-line no-empty
    } catch (error) {}

    expect(fd).not.toBe(null);
  });

  test('Добавление контента в файл', () => {
    createRWFile(testFile, 'const w = 1;');

    expect(readFileSync(testFile, { encoding: 'utf-8' })).toBe('const w = 1;');
  });
});
