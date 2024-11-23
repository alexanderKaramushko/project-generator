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

    // 3. пройтись по template.json и смерджить с package.json следующие поля:
    //    – name (мерджиться в src)
    //    – keywords (мерджиться в src)
    //    – description (мерджиться в src)
    //    – repository (мерджиться в src)
    //    – engines (мерджиться в src)
    //    – dependencies (мерджиться в src)
    //    – devDependencies (мерджиться в root)

    // 4. пройтись по template.json и создать следующие файлы в root, с наполнением из template.json:
    //    – eslintConfig
    //    – jestConfig
    //    – typescriptConfig

    // 5. установить зависимости через npm в root и в src
    // 6. инициализировать git и сделать начальный коммит
  }

}
