import { CompiledTemplateScript } from './CompiledTemplateScript';
import { TemplateData } from '../types/TemplateData';
/**
 * Represents a localization string parsed and compiled from a .lang file,
 * capable of validating arguments it expects at runtime
 * @private
 */
export declare class LangStringNode {
    readonly lang: string;
    readonly key: string;
    readonly value: string;
    readonly raw: string;
    readonly scripts: CompiledTemplateScript[];
    readonly args: {
        [key: string]: {
            isOptional: boolean;
            isArray: boolean;
            type: string;
        };
    };
    readonly argsValidator: ((args: TemplateData) => void) | undefined;
    private static readonly _argsDirective;
    private static readonly _validArgsDirective;
    private static readonly _argList;
    private static readonly _allArgs;
    private static readonly _singleArg;
    private static readonly _validArgTypes;
    constructor(lang: string, key: string, value: string, raw: string, scripts: CompiledTemplateScript[]);
}
