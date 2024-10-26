import dns from 'dns';
import { existsSync, mkdirSync } from 'node:fs';

import { CLIStorage } from './cli';

function checkIfOnline() {
  return new Promise((resolve) => {
    dns.lookup('registry.yarnpkg.com', (error) => {
      resolve(error == null);
    });
  });
}

export class Core {

  // eslint-disable-next-line no-useless-constructor, no-empty-function
  constructor(private CLI: CLIStorage) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, class-methods-use-this
  async createApp() {
    const { dir } = this.CLI.getArgs();

    if (!existsSync(dir)) {
      mkdirSync(dir);
    }

    if (await checkIfOnline()) {
      // eslint-disable-next-line no-console
      console.log('Вы в сети');
    }

    // 2. проверить наличие соединения через dns lookup +
    // 3. создать package.json
    // 4. сформировать массив с зависимостями
    //    типа ["основная зависимость 1", "project-generator-template@/template-name"]
    // 5. установить зависимости через npm
    // 6. смерджить appPackageJson и templatePackage.json
    // 7. инициализировать git и сделать начальный коммит
  }

}
