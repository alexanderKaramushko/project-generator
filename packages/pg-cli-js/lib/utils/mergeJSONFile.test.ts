/* eslint-disable sort-keys */
import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
// eslint-disable-next-line import/no-extraneous-dependencies
import { afterAll, describe, expect, test, vitest } from 'vitest';

import { mergeJSONFile } from './mergeJSONFile';

const testFile = path.resolve(__dirname, 'test.json');

describe('mergeJSONfile', () => {
  afterAll(() => {
    rmSync(testFile, { force: true });
  });

  test('JSON-файл мерджится с переданным объектом', async () => {
    writeFileSync(testFile, JSON.stringify({ field: 'value' }), { encoding: 'utf-8' });

    mergeJSONFile(testFile, {
      array: [1, 2, [{ name: 'value' }]],
      name: 'value 2',
      obj: {
        name: 'value',
      },
    }, () => {});

    await vitest.waitFor(() => expect(existsSync(testFile)).toBe(true));

    await vitest.waitFor(() => {
      const file = readFileSync(testFile, { encoding: 'utf8' });

      expect(JSON.parse(file)).toEqual({
        field: 'value',
        array: [1, 2, [{ name: 'value' }]],
        name: 'value 2',
        obj: { name: 'value' },
      });
    });
  });
});
