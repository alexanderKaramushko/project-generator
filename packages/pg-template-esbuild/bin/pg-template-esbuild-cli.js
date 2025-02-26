#!/usr/bin/env node
/* eslint-disable no-console */

process.on('unhandledRejection', (err) => {
  throw err;
});

const crossSpawn = require('cross-spawn');

const args = process.argv.slice(2);

const scriptIndex = args.findIndex(
  (x) => x === 'build' || x === 'start',
);

const script = scriptIndex === -1 ? args[0] : args[scriptIndex];
const nodeArgs = scriptIndex > 0 ? args.slice(0, scriptIndex) : [];

if (['build', 'start'].includes(script)) {
  const result = crossSpawn.sync(
    process.execPath,
    nodeArgs
      .concat(require.resolve(`../scripts/${script}`))
      .concat(args.slice(scriptIndex + 1)),
    { stdio: 'inherit' },
  );

  if (result.signal) {
    if (result.signal === 'SIGKILL' || result.signal === 'SIGTERM') {
      console.log(
        'Ошибка сбоорки. Процесс был завершен по причине отсутствия памяти или посредством польовательского ввода',
      );
    }

    process.exit(1);
  }

  process.exit(result.status);
} else {
  console.log(`Скрипт не найден: "${script}".`);
}
