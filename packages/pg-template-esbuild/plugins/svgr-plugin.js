/* eslint-disable consistent-return */
/**
 * @author Kazi Jawad
 * @description Доработанный плагин, загрузка ?url обрабатывается в esbuild
 *
 * @see {@link https://github.com/kazijawad/esbuild-plugin-svgr}
 */

const { readFileSync } = require('node:fs');
const { transform } = require('@svgr/core');

module.exports = (options) => ({
  name: 'svgr',
  setup(build) {
    build.onResolve({
      filter: /\.svg$/,
    }, async (args) => {
      switch (args.kind) {
        case 'import-statement':
        case 'require-call':
        case 'dynamic-import':
        case 'require-resolve':
          return;
        default:
          return {
            external: true,
          };
      }
    });

    build.onLoad({
      filter: /\.svg$/,
    }, async (args) => {
      const svg = readFileSync(args.path, {
        encoding: 'utf8',
      });
      const contents = await transform(svg, {
        ...options,
      }, {
        filePath: args.path,
      });

      if (args.suffix === '?url') {
        return null;
      }

      return {
        contents,
        loader: options.typescript ? 'tsx' : 'jsx',
      };
    });
  },
});
