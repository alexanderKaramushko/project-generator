/* eslint-disable no-console */
import chalk from 'chalk';
import { program } from 'commander';
import envinfo from 'envinfo';
import type { Preset } from 'pg-template-starter';

import packageJson from '../../../package.json';

/**
 * @description Аргументы командной строки.
 */
export type CLIArguments = {
  /**
   * @description Директория, в которой будет создано приложение.
   */
  dir: string;
  /**
   * @description Выбор шаблона проекта.
   */
  template: Preset;
}

/**
 * @namespace CLIStorage
 * @description Класс считывания аргументов CLI.
 */
export class CLIStorage {

  /**
   * @typedef {Object} CLIArguments
   * @property {string} dir Директория, в которой будет создано приложение.
   * @property {object} template Выбор шаблона проекта.
   */
  private args: CLIArguments = {
    dir: '',
    template: 'react-typescript',
  }

  constructor() {
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
      console.log(chalk.bold('\nИнформация об окружении:'));
      console.log(
        `\n  текущая версия ${packageJson.name}: ${packageJson.version}`,
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

  /**
   * @memberof CLIStorage
   * @description Логгирование переданных аргументов.
   * @returns {void}
   */
  public logArgs() {
    console.log(chalk.green('Переданные аргументы:'));
    console.table(this.args);
    console.log('');
  }

  /**
   * @memberof CLIStorage
   * @description Получение всех переданных аргументов.
   * @returns {CLIArguments}
   */
  public getArgs() {
    return this.args;
  }

}
