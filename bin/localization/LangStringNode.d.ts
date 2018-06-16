import { CompiledTemplateScript } from './CompiledTemplateScript';
/**
 * Represents a localization string parsed and compiled from a .lang file
 * @private
 */
export declare class LangStringNode {
    readonly key: string;
    readonly value: string;
    readonly raw: string;
    readonly scripts: CompiledTemplateScript[];
    constructor(key: string, value: string, raw: string, scripts: CompiledTemplateScript[]);
}
