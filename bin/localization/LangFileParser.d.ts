import { Language } from './Language';
/**
 * Class for parsing `.lang` files
 * @private
 */
export declare class LangFileParser {
    private static readonly _block;
    private static readonly _blocks;
    private static readonly _comments;
    private static readonly _outerNewLines;
    private static readonly _scriptTemplate;
    private static readonly _scriptTemplates;
    /**
     * Parse a given language file string and return a Language
     * object containing all the parsed nodes
     */
    static parseFile(langName: string, filePath: string, fileContents: string): Language;
}
