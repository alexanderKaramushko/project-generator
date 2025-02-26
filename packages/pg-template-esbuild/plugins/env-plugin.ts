/* eslint-disable sort-keys */
/* eslint-disable no-console */
/* eslint-disable import/no-extraneous-dependencies */
/**
 * @author rw3iss
 *
 * @see {@link https://github.com/rw3iss/esbuild-envfile-plugin}
 */

const fs = require('node:fs');
const path = require('node:path');
const dotenv = require('dotenv');

const DEFAULT_ENV = process.env.NODE_ENV || 'development';

function findEnvFile(dir, rootPath, env) {
  try {
    if (fs.existsSync(`${dir}/.${env}.env`)) {
      return `${dir}/.${env}.env`;
    }

    if (fs.existsSync(`${dir}/.env`)) {
      return `${dir}/.env`;
    }

    if (dir && dir !== '/') {
      if (dir === rootPath) {
        return undefined;
      }

      const next = path.resolve(dir, '../');
      return findEnvFile(next, rootPath, env);
    }

    return undefined;
  } catch (e) {
    console.warn('Exception in esbuild-envfile-plugin findEnvFile():', e);
    return undefined;
  }
}

module.exports = () => ({
  name: 'env',
  setup(build) {
    build.onResolve({
      filter: /^env$/,
    }, async (args) => {
      const rootPath = path.resolve('.');
      const env = ((build.initialOptions?.define || {})['process.env.NODE_ENV'] || DEFAULT_ENV).replace(/"/g, '');

      return {
        path: args.path,
        pluginData: {
          ...args.pluginData,
          envPath: findEnvFile(args.resolveDir, rootPath, env),
        },
        namespace: 'env-ns',
      };
    });

    build.onLoad({
      filter: /.*/, namespace: 'env-ns',
    }, async (args) => {
      const envPath = args.pluginData?.envPath;
      let config = {};
      let contents = '{}';

      if (envPath) {
        try {
          const data = await fs.promises.readFile(envPath, 'utf8');
          const buf = Buffer.from(data);

          config = dotenv.parse(buf);
          contents = JSON.stringify({
            ...process.env, ...config,
          });
        } catch (e) {
          console.warn('Exception in esbuild-envfile-plguin build.onLoad():', e);
        }
      }

      return {
        contents,
        loader: 'json',
      };
    });
  },
});
