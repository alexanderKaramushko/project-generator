import { execSync } from 'node:child_process';

module.exports = () => ({
  name: 'TypeScriptDeclarationsPlugin',
  setup(build) {
    build.onEnd((result) => {
      if (result.errors.length > 0) {
        return;
      }

      execSync('tsc --p tsconfig.declaration.json');
    });
  },
});
