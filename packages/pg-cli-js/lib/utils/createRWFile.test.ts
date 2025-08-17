import { execSync } from 'node:child_process';
import { existsSync, openSync, readFileSync, rmSync } from 'node:fs';
import path from 'node:path';
// eslint-disable-next-line import/no-extraneous-dependencies
import { afterEach, describe, expect, test, vitest } from 'vitest';

import { createRWFile } from './createRWFile';

const testFile = path.resolve(__dirname, 'test.ts');

describe('createRWFile', () => {
  afterEach(() => {
    rmSync(testFile);
  });

  test('Файл успешно создается, если его нет', async () => {
    createRWFile(testFile, 'file', () => {});

    await vitest.waitFor(() => expect(existsSync(testFile)).toBe(true));
  });

  test('Вызывается callback, если файл успешно создан', async () => {
    const callbackMock = vitest.fn();

    createRWFile(testFile, 'file', callbackMock);

    await vitest.waitFor(() => expect(callbackMock).toHaveBeenCalledWith(null));
  });

  test('Вызывается callback с null, если файл уже есть', async () => {
    const callbackMock = vitest.fn();

    execSync(`touch ${testFile}`);
    createRWFile(testFile, 'file', callbackMock);

    await vitest.waitFor(() => expect(callbackMock).toHaveBeenCalledWith(null));
  });

  test('Файл имеет правильные дескрипторы', async () => {
    rmSync(testFile, { force: true });

    createRWFile(testFile, 'file', () => {});

    await vitest.waitFor(() => expect(existsSync(testFile)).toBe(true));

    let fd: number | null = null;

    try {
      fd = openSync(testFile, 'w+');
    // eslint-disable-next-line no-empty
    } catch (error) {}

    expect(fd).not.toBe(null);
  });

  test('Добавление контента в файл', async () => {
    rmSync(testFile, { force: true });

    createRWFile(testFile, 'const w = 1;', () => {});

    await vitest.waitFor(() => expect(JSON.parse(readFileSync(testFile, { encoding: 'utf-8' }))).toBe('const w = 1;'));
  });
});
