import templateJSON from './template.json';

export type Preset = keyof typeof templateJSON;

type FileStructureLibName = string;

export type Template = Record<Preset, {
    /**
     * @description package.json
     */
    package: Record<string, any>;
    /**
     * @description Общие конфиги инфраструктуры
     */
    configs: {
        'eslint.config.js'?: Record<string, any>;
        'jest.config.ts'?: Record<string, any>;
        'tsconfig.json'?: Record<string, any>;
    };
    /**
     * @description Файловые структуры по пресету
     */
    fileStructure: FileStructureLibName;
    /**
     * @description Используемый сборщик проекта
     */
    builder: string;
}>
