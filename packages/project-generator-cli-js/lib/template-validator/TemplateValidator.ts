/* eslint-disable no-console */
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import chalk from 'chalk';

import { eslintSchema, packageSchema, templateSchema, typescriptSchema } from './schemas';

/**
 * @namespace TemplateValidator
 * @description Класс валидации JSON-схем.
 */
export class TemplateValidator {

  // eslint-disable-next-line no-useless-constructor, no-empty-function
  constructor(private template: Record<string, any>) {}

  /**
   * @memberof TemplateValidator
   * @description Валидация package.json-, eslint- и typescript-схем
   * @returns {boolean}
   */
  validate() {
    const ajv = new Ajv({
      strict: false,
    });

    ajv.addSchema(packageSchema);
    ajv.addSchema(eslintSchema);
    ajv.addSchema(typescriptSchema);

    addFormats(ajv);

    const valid = ajv.validate(templateSchema, this.template);

    if (!valid) {
      console.log(chalk.red('Схема template.json не валидная!'));
      console.table(ajv.errors?.reduce((errors, error) => {
        if (!error.instancePath) {
          return errors;
        }

        return {
          ...errors,
          [error.instancePath]: error.message,
        };
      }, {}));
    }

    return valid;
  }

}
