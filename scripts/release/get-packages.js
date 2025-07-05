const path = require('node:path');
const fs = require('node:fs');

function getPackages() {
  const packagesDir = path.join(process.cwd(), 'packages');
  const packages = fs.readdirSync(packagesDir);

  return packages
    .map((package) => ({
      packageDir: path.join(packagesDir, package),
      packageName: package,
    }))
    .filter(({ packageDir, packageName }) =>
      fs.existsSync(packageDir)
      && fs.statSync(packageDir).isDirectory()
      && (
        packageName.startsWith('pg')
        || packageName.startsWith('project')
      ));
}

module.exports = getPackages;
