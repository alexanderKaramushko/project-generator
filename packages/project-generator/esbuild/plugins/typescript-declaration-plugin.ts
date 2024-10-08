import type { Plugin } from 'esbuild';
// @ts-ignore
import { execSync } from 'node:child_process';

export default () => ({
  name: 'TypeScriptDeclarationsPlugin',
  setup(build) {
    build.onEnd((result) => {
      if (result.errors.length > 0) {
        return;
      }

      try {
        execSync('tsc --p tsconfig.build.json && tsc-alias -p tsconfig.build.json');
      } catch (error) {
        console.log(error);
      }
    });
  },
}) as Plugin;
