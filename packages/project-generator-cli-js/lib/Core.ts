/* eslint-disable no-console */
import chalk from 'chalk';
import { execSync } from 'child_process';
import dns from 'dns';
import { existsSync, mkdirSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import type { Template } from 'pg-template-starter';
import yoctoSpinner from 'yocto-spinner';

import { CLIStorage } from './CLIStorage';
import { TemplateValidator } from './template-validator';
import { createRWFile, mergeJSONFile } from './utils';

function checkIfOnline() {
  return new Promise((resolve) => {
    dns.lookup('registry.yarnpkg.com', (error) => {
      resolve(error == null);
    });
  });
}

/**
 * @namespace Core
 * @description Класс генерации проекта из пресетов.
 *
 * @todo Перевести пакеты на type: module
 * @todo Удалить лишние артефакты из сборки пресета
 * @todo Добавить файлы логов в пакеты
 * @todo Добавить логи сборки
 * @todo Проверить сборку на прод
 */
export class Core {

  // eslint-disable-next-line no-useless-constructor, no-empty-function
  constructor(private CLI: CLIStorage) {}

  /**
   * @memberof Core
   * @description
   * 1. Скачивает и распаковывает стартовый шаблон
   * 2. Скачивает стартовую структуру и устанавливает согласно пресету
   * 3. Устанавливает зависимости
   * 4. Подготовка (линтинг, гит)
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, class-methods-use-this
  async createApp() {
    const { dir, template } = this.CLI.getArgs();
    const spinner = yoctoSpinner().start();

    if (!existsSync(dir)) {
      spinner.text = chalk.blue(`Указанной директории ${dir} нет, создаем...`);
      mkdirSync(dir, { recursive: true });
    }

    if (await checkIfOnline()) {
      console.log(chalk.green('Вы в сети'));
    } else {
      console.log(chalk.red('Похоже, что вы отключены от сети'));
      process.exit(1);
    }

    spinner.text = chalk.blue('Скачивание стартового шаблона...');
    execSync('npm pack pg-template-starter -s');

    spinner.text = chalk.blue('Распаковка шаблона...');
    execSync(`tar -xf pg-template-starter-*.tgz -C ${dir} && rm pg-template-starter-*.tgz`);

    const packageDir = path.resolve(dir, 'package');
    const starterTemplateJSON = readFileSync(path.resolve(packageDir, 'template.json'), { encoding: 'utf-8' });
    const starterTemplateData = JSON.parse(starterTemplateJSON) as Template;

    if (!Reflect.has(starterTemplateData, template)) {
      console.log(chalk.red('Не найден шаблон! Похоже, передан неверный template'));
      execSync(`rm -r ${dir}`);
      spinner.stop();

      return;
    }

    const pickedTemplate = starterTemplateData[template];

    const templateValidator = new TemplateValidator(pickedTemplate);
    const valid = templateValidator.validate();

    if (!valid) {
      return;
    }

    spinner.text = chalk.blue('Создание конфигов...');
    Object.entries(pickedTemplate.configs).forEach(([config, content]) => {
      if (content) {
        createRWFile(path.resolve(packageDir, config), content as string | string[]);
      }
    });

    spinner.text = chalk.blue('Скачивание стартовой файловой структуры');
    execSync(`npm pack ${pickedTemplate.fileStructure} -s`);

    spinner.text = chalk.blue('Распаковка файловой структуры');
    execSync(`tar -xf ${pickedTemplate.fileStructure}-*.tgz -C ${dir} && rm ${pickedTemplate.fileStructure}-*.tgz`);

    const projectDir = path.resolve(packageDir, 'project');

    const filesPresets = path.resolve(packageDir, 'presets');
    const fileStructureDir = path.resolve(filesPresets, template);
    const structureList = readdirSync(fileStructureDir);

    spinner.text = chalk.blue('Создание структуры пресета...');
    structureList.forEach((name) => {
      execSync(`mv -n ${path.resolve(filesPresets, template, name)} ${projectDir}`);
    });

    execSync(`rm -rf ${filesPresets}`);

    spinner.text = chalk.blue('Создание пакетов...');
    Object.entries(pickedTemplate.projects).forEach(([project, content]) => {
      if (content) {
        mergeJSONFile(path.resolve(packageDir, project), content);
      }
    });

    spinner.text = chalk.blue('Установка зависимостей...');

    // Решение проблемы со установкой пакетов шаблона
    execSync(`cd ${packageDir} && npm config set registry https://registry.npmjs.com/ --userconfig .npmrc`);
    execSync(`cd ${packageDir} && npm install --legacy-peer-deps -s`);
    // Решение проблемы со установкой пакетов шаблона
    execSync(`cd ${projectDir} && npm config set registry https://registry.npmjs.com/ --userconfig .npmrc`);
    execSync(`cd ${projectDir} && npm install --legacy-peer-deps -s`);

    spinner.text = chalk.blue('Подготовка проекта...');

    execSync(`cd ${packageDir} && yarn lint:fix`);
    execSync(`cd ${packageDir} && git init && git add . && git commit -m 'initial commit'`);

    spinner.stop(chalk.green('Готово •͡˘㇁•͡˘'));
  }

}
