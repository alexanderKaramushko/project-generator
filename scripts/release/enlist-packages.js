const prompts = require('prompts');
const getPackages = require('./get-packages');

function enlistPackages() {
  const packages = getPackages();

  return prompts([
    {
      choices: packages.map(({ packageDir, packageName }) => ({
        title: packageName,
        value: {
          packageDir,
          packageName,
        },
      })),
      message: 'Выберите пакет для публикации',
      name: 'package',
      type: 'select',
    },
  ]);

}

module.exports = enlistPackages;
