/* eslint-disable no-console */
import chalk from 'chalk';
import { program } from 'commander';
import envinfo from 'envinfo';
import os from 'node:os';

import packageJson from '../../../package.json';
import { CLIAbstractParser } from './CLIAbstractParser';

/**
 * @augments CLIAbstractParser
 * @namespace CLIInputParser
 * @description Класс считывания аргументов CLI as is.
 */
export class CLIInputParser extends CLIAbstractParser {

  /**
   * @memberof CLIInputParser
   * @description Парсит аргументы введеные вручную в коммандную строку.
   */
  async parseInput() {
    program
      .name('project-generator')
      .description('Генератор шаблонов')
      .version(packageJson.version);

    program
      .arguments('<project-directory>')
      .option('-p, --template <char>', 'Шаблон приложения')
      .option('-n, --name <char>', 'Название приложения')
      .option('-v, --verbose', 'Показывать доп. логи')
      .option('--info', 'Показать информацию о хост-окружении')
      .on('--help', () => {
        console.log();
        console.log(`Версия приложения: ${chalk.bgYellow(packageJson.version)}`);
        console.log(
          `Только ${chalk.green('<project-directory>')} является обязательной опцией.`,
        );
        console.log(
          `Шаблон приложения опубликован на npm: ${chalk.blue('https://www.npmjs.com/package/pg-template')}`,
        );
        console.log();
      });

    program.parse();

    const options = program.opts();

    if (options.info) {
      console.log(chalk.bold(`${os.EOL}Информация об окружении:`));
      console.log(
        `${os.EOL}  текущая версия ${packageJson.name}: ${packageJson.version}`,
      );
      console.log(`Запущен из ${__dirname}`);

      envinfo
        .run(
          {
            Binaries: ['Node', 'npm', 'Yarn'],
            Browsers: [
              'Chrome',
              'Edge',
              'Internet Explorer',
              'Firefox',
              'Safari',
            ],
            System: ['OS', 'CPU'],
            npmGlobalPackages: ['create-react-app'],
            npmPackages: ['react', 'react-dom', 'react-scripts'],
          },
          {
            duplicates: true,
            showNotFound: true,
          },
        )
        .then(console.log);

      return;
    }

    // eslint-disable-next-line prefer-destructuring
    this.args.dir = program.args[0];
    this.args.template = options.template;
  }

}
