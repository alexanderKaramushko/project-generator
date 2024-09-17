/* eslint-disable sort-keys */
import type { BuildOptions } from 'esbuild';
// eslint-disable-next-line import/no-extraneous-dependencies
import esbuild from 'esbuild';
// eslint-disable-next-line import/no-extraneous-dependencies
import ignorePlugin from 'esbuild-plugin-ignore';

import { typeScriptDeclarationsPlugin } from './plugins';

const options = {
  entryPoints: ['./lib/index.ts'],
  platform: 'node',
  outdir: 'dist',
  bundle: true,
  watch: false,
  minify: true,
  sourcemap: false,
  target: 'esnext',
  format: 'cjs',
  plugins: [
    ignorePlugin([]),
    typeScriptDeclarationsPlugin(),
  ].filter(Boolean),
} as BuildOptions;

esbuild.build(options).catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
});
