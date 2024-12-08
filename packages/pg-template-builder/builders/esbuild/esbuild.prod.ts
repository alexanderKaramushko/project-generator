/* eslint-disable import/newline-after-import */
import jsx from '@svgr/plugin-jsx';
import svgo from '@svgr/plugin-svgo';
import dotenv from 'dotenv';
import { bool, cleanEnv, str } from 'envalid';
import type { BuildOptions } from 'esbuild';
import esbuild from 'esbuild';
import copyStatic from 'esbuild-plugin-copy';
// @ts-expect-error: no @types
import ignorePlugin from 'esbuild-plugin-ignore';
import { postcssModules, sassPlugin } from 'esbuild-sass-plugin';
import path from 'node:path';
import process from 'node:process';
// @ts-expect-error: no @types
import postCssImport from 'postcss-import';

import { envPlugin, svgrPlugin, typeScriptDeclarationsPlugin } from './plugins';

dotenv.config();

const env = cleanEnv(process.env, {
  ENTRY: str({
    default: './src/index.tsx',
  }),
  OUTPUT: str({
    default: './public',
  }),
  GENERATE_DECLARATIONS: bool({
    default: false,
  }),
  NODE_ENV: str({
    default: 'production',
  }),
  GLOBAL_SCSS_PATH: str(),
  SCSS_VARIABLES_PATH: str(),
  SCSS_MIXINS_PATH: str(),
  OPEN: bool({ default: false }),
});

const globalModulePaths = [env.GLOBAL_SCSS_PATH];
const scssVariablesFolder = path.join(__dirname, env.SCSS_VARIABLES_PATH);
const scssMixinsFolder = path.join(__dirname, env.SCSS_MIXINS_PATH);

const options = {
  assetNames: 'assets/[name]',
  entryPoints: [env.ENTRY, './src/service-worker.ts'],
  outdir: env.OUTPUT,
  publicPath: '/',
  bundle: true,
  watch: false,
  minify: true,
  sourcemap: false,
  target: 'esnext',
  format: 'esm',
  define: {
    'process.env.NODE_ENV': JSON.stringify(env.NODE_ENV),
  },
  plugins: [
    envPlugin(),
    sassPlugin({
      transform: postcssModules(
        {
          basedir: '',
          globalModulePaths,
        },
        [postCssImport()],
      ),
      precompile(source, pathname, isRoot) {
        return isRoot
          ? `
            @import '${scssVariablesFolder}/index.scss';
            @import '${scssMixinsFolder}/index.scss';
            ${source}
          `
          : source;
      },
    }),
    ignorePlugin([]),
    svgrPlugin({
      dimensions: false,
      plugins: [svgo, jsx],
    }),
    env.GENERATE_DECLARATIONS && typeScriptDeclarationsPlugin(),
    copyStatic({
      resolveFrom: 'cwd',
      assets: {
        from: ['./src/shared/assets/fonts/**/*'],
        to: ['./public'],
      },
    }),
  ].filter(Boolean),
  loader: {
    '.png': 'file',
    '.jpeg': 'file',
    '.jpg': 'file',
    '.js': 'jsx',
    '.woff2': 'file',
    '.svg': 'file',
  },
} as BuildOptions;

esbuild.build(options).catch((err) => {
  console.error(err);
});
