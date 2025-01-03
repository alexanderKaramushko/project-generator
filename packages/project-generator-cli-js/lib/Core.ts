/* eslint-disable no-console */
import chalk from 'chalk';
import { execSync } from 'child_process';
import dns from 'dns';
import { existsSync, mkdirSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import type { Template } from 'pg-template-starter';

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

// 2. извлечь данные по preset из template.json (возможно стоит избавиться от файловой структуры
//    в пакете вообще и делать генерацию полностью из template.json)

// 3. из извлеченных данных по preset смерджить с package.json следующие поля:
//    – name (мерджиться в src)
//    – keywords (мерджиться в src)
//    – description (мерджиться в src)
//    – repository (мерджиться в src)
//    – engines (мерджиться в src)
//    – dependencies (мерджиться в src)
//    – devDependencies (мерджиться в root)

// 4. Добавить build- и start-скрипты на основе builder, например: npm run start {package.builder}-cli start

// 5. из извлеченных данных по preset создать следующие файлы в root, с наполнением из template.json:
//    – eslintConfig
//    – jestConfig
//    – typescriptConfig

// 6. из извлеченных данных по preset создать файловую структуру по схеме поля structure
//    и записать в контент, если в схеме файл с полем content

// 7. установить зависимости через npm в root и в src
// 8. запустить линтинг по файлам
// 9. инициализировать git и сделать начальный коммит

// Насчет сборщика:
// Нужно, чтобы в итоговом созданном шаблоне были обязательно два скрипта: start и build
// Пример: "start": "esbuild-cli или pg-template-builder/esbuild-cli start"
// То есть надо подумать как обращаться к внутренностям пакет, мб просто публиковать каждый билдер отдельным пакетом.

// Или будет обращение к pg-template-builder с прокидыванием названия builder,
// который он запустит: "start": "pg-template-builder start --builder esbuild"
// Запускать будет через bin или workspaces

/**
 * Класс скачивания пакета шаблонов и генерации проекта из шаблона.
 */
export class Core {

  // eslint-disable-next-line no-useless-constructor, no-empty-function
  constructor(private CLI: CLIStorage) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, class-methods-use-this
  async createApp() {
    const { dir, template } = this.CLI.getArgs();

    if (!existsSync(dir)) {
      console.log(chalk.blue(`Указанной директории ${dir} нет, создаем`));
      mkdirSync(dir, { recursive: true });
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
    execSync(`tar -xvf ${normalizedDir}pg-template-starter-*.tgz -C ${dir} && rm ${normalizedDir}pg-template-starter-*.tgz`);

    const packageDir = path.resolve(dir, 'package');
    const templateJSON = readFileSync(path.resolve(packageDir, 'template.json'), { encoding: 'utf-8' });
    const templateData = JSON.parse(templateJSON) as Template;

    if (!Reflect.has(templateData, template)) {
      console.log(chalk.red('Не найден шаблон! Похоже, передан неверный template'));
      execSync(`rm -r ${dir}`);
      return;
    }

    const pickedTemplate = templateData[template];
    const { devDependencies, ...projectFields } = pickedTemplate.package;

    const templateValidator = new TemplateValidator(pickedTemplate);
    const valid = templateValidator.validate();

    if (!valid) {
      return;
    }

    const projectDir = path.resolve(packageDir, 'project');

    mergeJSONFile(path.resolve(projectDir, 'package.json'), projectFields);
    mergeJSONFile(path.resolve(packageDir, 'package.json'), { devDependencies });

    Object.entries(pickedTemplate.configs).forEach(([config, content]) => {
      if (content) {
        createRWFile(path.resolve(packageDir, config), JSON.stringify(content));
      }
    });

    console.log(chalk.blue('Скачивание стартовой файловой структуры'));
    execSync(`npm pack ${pickedTemplate.fileStructure} --pack-destination ${dir}`);

    console.log(chalk.blue('Распаковка файловой структуры'));
    execSync(`tar -xvf ${normalizedDir}${pickedTemplate.fileStructure}-*.tgz -C ${dir} && rm ${normalizedDir}${pickedTemplate.fileStructure}-*.tgz`);

    const filesPresets = path.resolve(packageDir, 'presets');
    const fileStructureDir = path.resolve(filesPresets, template);
    const structureList = readdirSync(fileStructureDir);

    structureList.forEach((name) => {
      execSync(`mv -n ${path.resolve(filesPresets, template, name)} ${projectDir}`);
    });

    execSync(`rm -rf ${filesPresets}`);
  }

}
