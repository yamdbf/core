import { Language } from './Language';
/**
 * Class for parsing `.lang` files
 * @private
 */
export declare class LangFileParser {
    private static _parseBlock;
    private static _parseBlocks;
    private static _stripComments;
    private static _trimNewlines;
    /**
     * Parse a given language file string and return a Language
     * object containing all the parsed values
     */
    static parseFile(langName: string, fileContents: string): Language;
}
