import * as env from 'env';
import { cleanEnv, str } from 'envalid';

const ENV = cleanEnv(env, {
  NODE_ENV: str({
    choices: ['development', 'production', 'test', 'demo'],
    default: 'production',
  }),
});

const { NODE_ENV } = ENV;

export default {
  isDev: NODE_ENV === 'development',
  isProd: NODE_ENV === 'production',
  isStand: ['production', 'test', 'demo'].includes(NODE_ENV),
  isTest: NODE_ENV === 'test',
};
