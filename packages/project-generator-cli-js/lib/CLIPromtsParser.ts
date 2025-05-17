import prompts from 'prompts';

import { CLIAbstractParser } from './CLIAbstractParser';

/**
 * @augments CLIAbstractParser
 * @namespace CLIPromptsParser
 * @description Класс считывания аргументов CLI из промпт-ов.
 */
export class CLIPromptsParser extends CLIAbstractParser {

  /**
   * @memberof CLIPromptsParser
   * @description Парсит аргументы на основе выбранных промпт-ов.
   */
  async parseInput() {
    const response = await prompts([
      {
        choices: [
          {
            title: 'React',
            value: 'react',
          },
          {
            title: 'React с TS',
            value: 'react-typescript',
          },
          {
            title: 'Plain JS',
            value: 'plain-js',
          },
        ],
        message: 'Выберите шаблон',
        name: 'template',
        type: 'select',
      },
      {
        choices: [
          {
            title: 'ESBuild',
            value: 'esbuild',
          },
          {
            title: 'Parcel',
            value: 'parcel',
          },
          {
            title: 'Rollup',
            value: 'rollup',
          },
        ],
        message: 'Выберите билдер',
        name: 'builder',
        type: 'select',
      },
      {
        initial: './',
        message: 'Укажите директорию проекта',
        name: 'dir',
        type: 'text',
      },
    ]);

    this.args.template = response.template;
    this.args.builder = response.builder;
    this.args.dir = response.dir;
  }

}
