/* eslint-disable no-console */
import chalk from 'chalk';
import { Preset } from 'pg-template-starter';

/**
 * @description Аргументы командной строки.
 */
export type CLIArguments = {
  /**
   * @description Директория, в которой будет создано приложение.
   */
  dir: string;
  /**
   * @description Билде, который будет собирать проект.
   */
  builder: string;
  /**
   * @description Выбор шаблона проекта.
   */
  template: Preset;
}

export interface CLIParser {
  parseInput(): Promise<void>;
  logArgs(): void;
  getArgs(): CLIArguments;
}

/**
 * @class
 * @namespace CLIAbstractParser
 * @description Абстрактный класс парсинга коммандной строки.
 */
export abstract class CLIAbstractParser implements CLIParser {

  /**
   * @typedef {Object} CLIAbstractParser
   * @property {string} dir Директория, в которой будет создано приложение.
   * @property {string} builder Билдер, который будет собирать проект.
   * @property {object} template Выбор шаблона проекта.
   */
  protected args: CLIArguments = {
    builder: 'esbuild',
    dir: '',
    template: 'react-typescript',
  }

  // eslint-disable-next-line class-methods-use-this
  async parseInput(): Promise<void> {
    throw new Error('Метод не имплементирован.');
  }

  /**
   * @memberof CLIAbstractParser
   * @description Логгирование переданных аргументов.
   * @returns {void}
   */
  public logArgs() {
    console.log(chalk.green('Переданные аргументы:'));
    console.table(this.args);
    console.log('');
  }

  /**
   * @memberof CLIAbstractParser
   * @description Получение всех переданных аргументов.
   * @returns {CLIArguments}
   */
  public getArgs() {
    return this.args;
  }

}
