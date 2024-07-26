/* eslint-disable no-console */
import { CLIArguments, CLIStorage } from './cli';

export class Core {

  // eslint-disable-next-line no-useless-constructor
  constructor(private CLI: CLIStorage) {}

  createApp(CLIArgs: CLIArguments) {
    console.log(this);

    // до начала работы создать монорепу project-generator-templates@template-name

    // 1. проверить, что нужная директория существует
    // 2. проверить наличие соединения через dns lookup
    // 3. создать package.json
    // 4. сформировать массив с зависимостями
    //    типа ["основная зависимость 1", "project-generator-template@/template-name"]
    // 5. установить зависимости через npm
    // 6. смерджить appPackageJson и templatePackage.json
    // 7. инициализировать git и сделать начальный коммит
  }

}
