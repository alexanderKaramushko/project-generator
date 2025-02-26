const { execSync } = require('child_process');

const args = process.argv.slice(2);

const builderIndex = args.findIndex(
  (x) => x.startsWith('---builder'),
);

const builder = builderIndex === -1 ? 'esbuild' : args[builderIndex].split('=')[1];

execSync(`pg-template-${builder}-cli start`);
