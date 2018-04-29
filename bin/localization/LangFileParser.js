"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Language_1 = require("./Language");
/**
 * Class for parsing `.lang` files
 * @private
 */
class LangFileParser {
    /**
     * Parse a given language file string and return a Language
     * object containing all the parsed values
     */
    static parseFile(langName, filePath, fileContents) {
        const lang = new Language_1.Language(langName);
        const blocks = fileContents.match(LangFileParser._parseBlocks);
        if (!blocks)
            throw new Error(`The given Lang file contains no valid localization strings: ${filePath}`);
        for (const block of blocks) {
            const match = block.match(LangFileParser._parseBlock);
            const raw = match[1];
            const key = match[2];
            const value = match[3]
                .replace(LangFileParser._stripComments, '')
                .replace(LangFileParser._trimNewlines, '')
                .trim();
            lang.strings[key] = value;
            lang.raw[key] = raw;
        }
        return lang;
    }
}
LangFileParser._parseBlock = /(\[(\w+)\]\n([\s\S]*?))(?=\n\n+?(?:## *.*\n)*\[\w+\]\n.+|\n*?$)/;
LangFileParser._parseBlocks = new RegExp(LangFileParser._parseBlock, 'g');
LangFileParser._stripComments = /^(?!$)\s*##.*\n|##.*$/gm;
LangFileParser._trimNewlines = /^\n|\n$/g;
exports.LangFileParser = LangFileParser;

//# sourceMappingURL=LangFileParser.js.map
