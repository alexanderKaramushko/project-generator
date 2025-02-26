/**
 * @author rw3iss
 *
 * @see {@link https://github.com/rw3iss/esbuild-envfile-plugin}
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import type { Plugin } from 'esbuild';
import dotenv from 'dotenv';

const DEFAULT_ENV = process.env.NODE_ENV || 'development';

function findEnvFile(dir: string, rootPath: string, env: string): string | undefined {
  try {
    if (fs.existsSync(`${dir}/.${env}.env`)) {
      return `${dir}/.${env}.env`;
    }
    else if (fs.existsSync(`${dir}/.env`)) {
      return `${dir}/.env`;
    }
    else if (dir && dir !== '/') {
      if (dir === rootPath) {
        return undefined;
      }
      const next = path.resolve(dir, '../');
      return findEnvFile(next, rootPath, env);
    }
    return undefined;
  }
  catch (e) {
    console.warn('Exception in esbuild-envfile-plugin findEnvFile():', e);
    return undefined;
  }
}

export default () => ({
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
          // eslint-disable-next-line node/prefer-global/buffer
          const buf = Buffer.from(data);
          config = dotenv.parse(buf);
          contents = JSON.stringify({
            ...process.env, ...config,
          });
        }
        catch (e) {
          console.warn('Exception in esbuild-envfile-plguin build.onLoad():', e);
        }
      }

      return {
        contents,
        loader: 'json',
      };
    });
  },
} as Plugin);
