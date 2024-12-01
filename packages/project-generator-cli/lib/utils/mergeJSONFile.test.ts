import { readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
// eslint-disable-next-line import/no-extraneous-dependencies
import { afterEach, describe, expect, test } from 'vitest';

import { createRWFile } from './createRWFile';
import { mergeJSONFile } from './mergeJSONFile';

const testFile = path.resolve(__dirname, 'test.json');
const wrongTestFile = path.resolve(__dirname, 'test.ts');

describe('mergeJSONfile', () => {
  afterEach(() => {
    rmSync(testFile, { force: true });
    rmSync(wrongTestFile, { force: true });
  });

  test('JSON-файл мерджится с переданным объектом', () => {
    createRWFile(testFile);
    writeFileSync(testFile, JSON.stringify({ name: 'value' }), { encoding: 'utf-8' });

    mergeJSONFile(testFile, {
      array: [1, 2, [{ name: 'value' }]],
      name: 'value 2',
      obj: {
        name: 'value',
      },
    });

    const file = readFileSync(testFile, { encoding: 'utf8' });

    expect(file).toEqual(JSON.stringify({
      name: 'value 2',
      // eslint-disable-next-line sort-keys
      array: [1, 2, [{ name: 'value' }]],
      obj: {
        name: 'value',
      },
    }));
  });
});
