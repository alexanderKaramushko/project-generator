/* eslint-disable import/newline-after-import */
import jsx from '@svgr/plugin-jsx';
import dotenv from 'dotenv';
import { bool, cleanEnv, port, str } from 'envalid';
import type { BuildOptions } from 'esbuild';
import esbuild from 'esbuild';
// @ts-expect-error: no @types
import ignorePlugin from 'esbuild-plugin-ignore';
import { postcssModules, sassPlugin } from 'esbuild-sass-plugin';
import liveServer from 'live-server';
import path from 'node:path';
import process from 'node:process';
// @ts-expect-error: no @types
import postCssImport from 'postcss-import';

import { envPlugin, svgrPlugin } from './plugins';

dotenv.config({
  path: path.join(__dirname, `../${process.env.ENV_NAME}.env`),
});

const env = cleanEnv(process.env, {
  ENTRY: str({
    default: './src/index.tsx',
  }),
  FILE: str({
    default: 'index.html',
  }),
  HOST: str({
    default: 'localhost',
  }),
  OUTPUT: str({
    default: 'public/index.js',
  }),
  PORT: port({
    default: 3000,
  }),
  ROOT: str({
    default: 'public',
  }),
  NODE_ENV: str({
    default: 'development',
  }),
  GLOBAL_SCSS_PATH: str(),
  SCSS_VARIABLES_PATH: str(),
  SCSS_MIXINS_PATH: str(),
  OPEN: bool({ default: false }),
});

const globalModulePaths = [env.GLOBAL_SCSS_PATH];
const scssVariablesFolder = path.join(__dirname, env.SCSS_VARIABLES_PATH);
const scssMixinsFolder = path.join(__dirname, env.SCSS_MIXINS_PATH);

liveServer.start({
  host: env.HOST,
  port: env.PORT,
  file: env.FILE,
  root: env.ROOT,
  open: env.open,
});

const options = {
  assetNames: 'assets/[name]',
  entryPoints: [env.ENTRY],
  outfile: env.OUTPUT,
  bundle: true,
  watch: {
    onRebuild(error) {
      if (error) {
        console.error('esbuild: Watch build failed:', error.message);
      } else {
        // eslint-disable-next-line no-console
        console.log('esbuild: Watch build succeeded');
      }
    },
  },
  minify: false,
  sourcemap: 'linked',
  target: 'esnext',
  format: 'iife',
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
      plugins: [jsx],
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
