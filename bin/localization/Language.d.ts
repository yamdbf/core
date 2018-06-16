import { LangStringNode } from './LangStringNode';
/**
 * Holds the localization strings for a given language
 * @private
 */
export declare class Language {
    name: string;
    strings: {
        [key: string]: LangStringNode;
    };
    constructor(name: string);
    /**
     * Concatenate another Language object's strings of the
     * same language with this Language object's strings,
     * adding them to this Language object's `strings` object
     */
    concat(lang: Language): void;
}
