const { execSync } = require('child_process');

execSync(`cross-env ENV_NAME=.develop ts-node ${require.resolve('../esbuild.dev.ts')}`);
