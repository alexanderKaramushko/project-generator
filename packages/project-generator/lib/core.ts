/* eslint-disable no-console */
import chalk from 'chalk';
import { execSync } from 'child_process';
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
      console.log(chalk.blue(`Указанной директории ${dir} нет, создаем`));
      mkdirSync(dir);
    }

    if (await checkIfOnline()) {
      console.log(chalk.green('Вы в сети'));
    } else {
      console.log(chalk.red('Похоже, что вы отключены от сети'));
    }

    console.log(chalk.blue(`Переходим в директорию ${dir}`));

    console.log(chalk.blue('Скачивание стартового шаблона'));
    execSync(`npm pack pg-template-starter --pack-destination ${dir}`);

    const normalizedDir = dir.endsWith('/') ? dir : `${dir}/`;

    console.log(chalk.blue('Распаковка шаблона'));
    execSync(`cd ${dir} && tar -xvf pg-template-starter-*.tgz && rm ${normalizedDir}pg-template-starter-*.tgz`);

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
