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

function enlistVersions() {
  return prompts([
    {
      choices: [
        {
          title: 'patch',
          value: 'patch',
        },
        {
          title: 'minor',
          value: 'minor',
        },
        {
          title: 'major',
          value: 'major',
        },
      ],
      message: 'Выберите версию',
      name: 'version',
      type: 'select',
    },
  ]);
}

module.exports = {
  enlistPackages,
  enlistVersions,
};
