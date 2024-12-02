import templateJSON from './template.json';

export type Preset = keyof typeof templateJSON;

export type Template = Record<Preset, {
    package: Record<string, any>;
    configs: Partial<typeof templateJSON[keyof typeof templateJSON]>;
}>
