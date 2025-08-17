/* eslint-disable prefer-arrow-callback */
/* eslint-disable no-undef */
/* eslint-disable no-console */
import async, { AsyncResultCallback, AsyncResultRestCallback, ErrorCallback } from 'async';
import chalk from 'chalk';
import { exec } from 'child_process';
import dns from 'dns';
import { ExecException } from 'node:child_process';
import { existsSync, mkdir, readdir, readFile, rm } from 'node:fs';
import path from 'node:path';
import { Template } from 'pg-template-starter';
import yoctoSpinner from 'yocto-spinner';

import { CLIAbstractParser } from './CLIAbstractParser';
import { TemplateValidator } from './template-validator';
import { createRWFile, identity, mergeJSONFile } from './utils';

type FileContent = string;

/**
 * @namespace Core
 * @description Класс генерации проекта из пресетов.
 *
 * @todo Добавить codegen в зависимости от прописанного templateName в package.json после генерации проекта
 * @todo Перевести пакеты на type: module
 * @todo Добавить файл логов pg-generator-debug.log
 *
 * External
 * @todo Исследовать возможность парсинга и переноса todo в issues через github api.
 * Для этого надо будет настроить минимальный пайплайн со сборкой jsdoc -> json -> github api
 *
 * External
 * @todo Добавить changelog с описанием версий.
 * Пока что можно сделать bash-утилиту, которая будет писать в CHANGELOG.md
 * и создавать тег с указанием на changelog без автоматизации в пайплайне.
 * Далее можно сделать стенд с версиями.
 *
 * @todo Конфиг должен быть легко настраиваемым, то есть реализовываться весь шаблон должен через json
 * Должно быть два конфига: внешний (инфраструктурный, eslint, jest и т.д) и внутренний (проект с dev-зависимостями).
 * Внутренний конфиг подключает внешний через определеное поле в пакете.
 * Шаги:
 * – fileStructure нужно убрать из pg-template-starter. \n
 * – Сам pg-template-starter переименовать в pg-template-configs. \n
 * – После загрузки шаблона из structures прочитать поле externalConfigName \n
 * – Скачать внешний конфиг по externalConfigName
 */
export class Core {

  // eslint-disable-next-line no-useless-constructor, no-empty-function
  constructor(private CLI: CLIAbstractParser) {}

  /**
   * @memberof Core
   * @description
   * 1. Скачивает и распаковывает стартовый шаблон
   * 2. Скачивает стартовую структуру и устанавливает согласно пресету
   * 3. Устанавливает зависимости
   * 4. Подготовка (линтинг, гит)
   */
  async createApp() {
    const { dir, template } = this.CLI.getArgs();
    const spinner = yoctoSpinner().start();

    let packageDir: string;
    let starterTemplateData: Template;
    let pickedTemplate: Record<string, any>;
    let projectDir: string;
    let presetsDir: string;
    let fileStructureDir: string;

    // eslint-disable-next-line consistent-return
    function checkAndMaybeCreateDir(callback: ErrorCallback) {
      if (!existsSync(dir)) {
        spinner.text = chalk.blue(`Указанной директории ${dir} нет, создаем...`);
        mkdir(dir, { recursive: true }, identity(callback));
      } else {
        return callback(null);
      }
    }

    function checkIfOnline(callback: ErrorCallback) {
      dns.lookup('registry.yarnpkg.com', identity(callback));
    }

    function downloadTemplate(
      callback: AsyncResultRestCallback<string, ExecException | null>,
    ) {
      spinner.text = chalk.blue('Скачивание стартового шаблона...');
      exec('npm pack pg-template-starter -s', callback);
    }

    function setupTemplate(stdout: string, stderr: string, callback: ErrorCallback) {
      spinner.text = chalk.blue('Распаковка шаблона...');
      exec(`tar -xf ${stdout.trim()} -C ${dir} && rm ${stdout.trim()}`, identity(callback));
    }

    function getTemplateData(callback: AsyncResultCallback<FileContent, NodeJS.ErrnoException | null>) {
      packageDir = path.resolve(dir, 'package');

      readFile(path.resolve(packageDir, 'template.json'), { encoding: 'utf-8' }, callback);
    }

    // eslint-disable-next-line consistent-return
    function hasTemplate(data: FileContent, callback: ErrorCallback) {
      spinner.text = chalk.blue('Проверка шаблона...');

      try {
        starterTemplateData = JSON.parse(data) as Template;

        if (!Reflect.has(starterTemplateData, template)) {
          exec(`rm -r ${dir}`, identity(callback));
        } else {

          return callback(null);
        }
      } catch (error) {
        return callback(new Error(`Не удалось распарсить шаблон: ${template}`));
      }
    }

    function validateTemplate(callback: ErrorCallback) {
      spinner.text = chalk.blue('Валидация шаблона...');

      pickedTemplate = starterTemplateData[template];

      const templateValidator = new TemplateValidator(pickedTemplate);
      const valid = templateValidator.validate();

      if (!valid) {
        return callback(new Error(`Невалидный шаблон ${template}`));
      }

      return callback(null);
    }

    function createConfigs(callback: ErrorCallback) {
      spinner.text = chalk.blue('Создание конфигов...');

      async.each(Object.entries(pickedTemplate.configs), ([config, content], innerCallback) => {
        if (content && !existsSync(path.resolve(packageDir, config))) {
          createRWFile(path.resolve(packageDir, config), content as string | string[], innerCallback);
        } else {
          innerCallback(null);
        }
      }, identity(callback));
    }

    function downloadFileStructure(callback: ErrorCallback) {
      spinner.text = chalk.blue('Скачивание стартовой файловой структуры');
      exec(`npm pack ${pickedTemplate.fileStructure} -s`, identity(callback));
    }

    function setupFileStructure(callback: ErrorCallback) {
      spinner.text = chalk.blue('Распаковка файловой структуры');
      exec(
        `tar -xf ${pickedTemplate.fileStructure}-*.tgz -C ${dir} && rm ${pickedTemplate.fileStructure}-*.tgz`,
        identity(callback),
      );
    }

    function createFileStructure(callback: ErrorCallback) {
      spinner.text = chalk.blue('Создание структуры пресета...');

      projectDir = path.resolve(packageDir, 'project');
      presetsDir = path.resolve(packageDir, 'presets');
      fileStructureDir = path.resolve(presetsDir, template);

      async.waterfall([
        function getPresetFiles(innerCallback: AsyncResultCallback<any, any>) {
          readdir(fileStructureDir, innerCallback);
        },
        function createPresetFiles(files: string[], innerCallback: ErrorCallback) {
          async.each(files, (name, cb: ErrorCallback) => {
            exec(`mv -n ${path.resolve(presetsDir, template, name)} ${projectDir}`, cb);
          }, identity(innerCallback));
        },
        function deletePresets(innerCallback: ErrorCallback) {
          exec(`rm -rf ${presetsDir}`, identity(innerCallback));
        },
      ], identity(callback));
    }

    function createPackages(callback: ErrorCallback) {
      spinner.text = chalk.blue('Создание пакетов...');

      async.each(Object.entries(pickedTemplate.projects), ([project, content], innerCallback) => {
        if (content) {
          mergeJSONFile(path.resolve(packageDir, project), content, innerCallback);
        }
      }, identity(callback));
    }

    function installDependencies(callback: ErrorCallback) {
      spinner.text = chalk.blue('Установка зависимостей...');

      async.each([
        // Решение проблемы со установкой пакетов шаблона через userconfig
        `cd ${packageDir} && npm config set registry https://registry.npmjs.com/ --userconfig .npmrc`,
        `cd ${packageDir} && npm install --legacy-peer-deps -s`,
        // Решение проблемы со установкой пакетов шаблона через userconfig
        `cd ${projectDir} && npm config set registry https://registry.npmjs.com/ --userconfig .npmrc`,
        `cd ${projectDir} && npm install --legacy-peer-deps -s`,
      ], (command, innerCollback) => {
        exec(command, innerCollback);
      }, identity(callback));
    }

    function deleteArtifacts(callback: ErrorCallback) {
      spinner.text = chalk.blue('Удаление артифактов...');

      const artifactsNames = ['template.json', 'template.ts'];

      async.each(artifactsNames, (artifactName, innerCollback) => {
        rm(path.resolve(packageDir, artifactName), innerCollback);
      }, identity(callback));
    }

    function setupGit(callback: ErrorCallback) {
      spinner.text = chalk.blue('Установка git...');

      exec(`cd ${packageDir} && git init && git add . && git commit  -m 'initial commit'`, identity(callback));
    }

    function prepareProject(callback: ErrorCallback) {
      spinner.text = chalk.blue('Подготовка проекта...');

      async.parallel([
        installDependencies,
        deleteArtifacts,
        setupGit,
      ], identity(callback));
    }

    function lint(callback: ErrorCallback) {
      spinner.text = chalk.blue('Линтинг...');

      exec(`cd ${packageDir} && yarn lint:fix`, callback);
    }

    async.waterfall([
      checkAndMaybeCreateDir,
      checkIfOnline,
      downloadTemplate,
      setupTemplate,
      getTemplateData,
      hasTemplate,
      validateTemplate,
      createConfigs,
      downloadFileStructure,
      setupFileStructure,
      createFileStructure,
      createPackages,
      prepareProject,
      lint,
    // eslint-disable-next-line @typescript-eslint/no-shadow
    ], function finalCallback(err: NodeJS.ErrnoException | Error | null | undefined) {
      if (err) {
        console.log('\n');
        console.log(chalk.red(err.message));

        spinner.stop();
      } else {
        spinner.stop(chalk.green(`Проект установлен в ${dir} •͡˘㇁•͡˘`));
      }
    });
  }

}
