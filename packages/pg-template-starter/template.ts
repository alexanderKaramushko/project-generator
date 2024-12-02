import templateJSON from './template.json';

export type Preset = keyof typeof templateJSON;

type FileStructure = {
    name: string;
    content: string;
    children: FileStructure[];
}

export type Template = Record<Preset, {
    package: Record<string, any>;
    configs: {
        'eslint.config.js'?: Record<string, any>;
        'jest.config.ts'?: Record<string, any>;
        'tsconfig.json'?: Record<string, any>;
    };
    fileStructure: FileStructure;
}>
