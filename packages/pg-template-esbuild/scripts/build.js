/* eslint-disable no-console */
/* eslint-disable sort-keys */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable import/newline-after-import */
const jsx = require('@svgr/plugin-jsx');
const svgo = require('@svgr/plugin-svgo');
const copyStatic = require('esbuild-plugin-copy');
const dotenv = require('dotenv');
const { bool, cleanEnv, str } = require('envalid');
const esbuild = require('esbuild');
// @ts-expect-error: no @types
const ignorePlugin = require('esbuild-plugin-ignore');
const { postcssModules, sassPlugin } = require('esbuild-sass-plugin');
const path = require('node:path');
const process = require('node:process');
// @ts-expect-error: no @types
const postCssImport = require('postcss-import');

const envPlugin = require('../plugins/env-plugin');
const svgrPlugin = require('../plugins/svgr-plugin');
const typeScriptDeclarationsPlugin = require('../plugins/typescript-declaration-plugin');

dotenv.config({
  path: path.join(process.cwd(), './.production.env'),
});

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
};

esbuild.build(options).catch((err) => {
  console.error(err);
});
