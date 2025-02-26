import templateJSON from './template.json';

export type Preset = keyof typeof templateJSON;

type FileStructureLibName = string;

export type Template = Record<Preset, {
    /**
     * @description package.json
     */
    projects: Record<string, any>;
    /**
     * @description Общие конфиги инфраструктуры
     */
    configs: Record<string, any>;
    /**
     * @description Файловые структуры по пресету
     */
    fileStructure: FileStructureLibName;
    /**
     * @description Используемый сборщик проекта
     */
    builder: string;
}>
