const shelljs = require('shelljs');
const path = require('node:path');

function commitRelease({
  packageName,
  packageDir,
  versionType,
  version,
}) {
  shelljs.cmd('git', 'reset', '*');
  shelljs.cmd('git', 'add', path.join(packageDir, 'package.json'));
  shelljs.cmd('git', 'add', path.join(process.cwd(), 'package-lock.json'));
  shelljs.cmd('git', 'commit', '-m', `${versionType}-релиз версии ${version} пакета ${packageName}`);
  shelljs.cmd('git', 'push');
}

module.exports = commitRelease;
