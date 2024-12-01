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
        execSync('tsc --p tsconfig.declaration.json');
      } catch (error) {
        // eslint-disable-next-line no-console
        console.log(error);
      }
    });
  },
}) as Plugin;
