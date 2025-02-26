const { execSync } = require('child_process');

execSync(`cross-env ENV_NAME=.production && tsx ${require.resolve('../esbuild.prod.ts')} && tsc-alias -p tsconfig.alias.json`);
