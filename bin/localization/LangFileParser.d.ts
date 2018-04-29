import { Language } from './Language';
/**
 * Class for parsing `.lang` files
 * @private
 */
export declare class LangFileParser {
    private static readonly _parseBlock;
    private static readonly _parseBlocks;
    private static readonly _stripComments;
    private static readonly _trimNewlines;
    /**
     * Parse a given language file string and return a Language
     * object containing all the parsed values
     */
    static parseFile(langName: string, filePath: string, fileContents: string): Language;
}
