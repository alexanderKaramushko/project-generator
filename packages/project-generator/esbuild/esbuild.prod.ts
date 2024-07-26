import type { BuildOptions } from 'esbuild';
import esbuild from 'esbuild';
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
  console.error(err);
});
