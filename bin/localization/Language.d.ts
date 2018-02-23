/**
 * Holds the localization strings for a given language
 * @private
 */
export declare class Language {
    name: string;
    strings: {
        [key: string]: string;
    };
    raw: {
        [key: string]: string;
    };
    constructor(name: string);
    /**
     * Concatenate another Language object's strings of the
     * same language with this Language object's strings,
     * saving them to this Language object's `strings` value
     */
    concat(lang: Language): void;
}
