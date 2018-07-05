"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Language_1 = require("./Language");
const CompiledTemplateScript_1 = require("./CompiledTemplateScript");
const LangStringNode_1 = require("./LangStringNode");
/**
 * Class for parsing `.lang` files
 * @private
 */
class LangFileParser {
    /**
     * Parse a given language file string and return a Language
     * object containing all the parsed nodes
     */
    static parseFile(langName, filePath, fileContents) {
        const lang = new Language_1.Language(langName);
        const blocks = fileContents.match(LangFileParser._blocks);
        if (!blocks)
            throw new Error(`The given Lang file contains no valid localization strings: ${filePath}`);
        for (const block of blocks) {
            const match = block.match(LangFileParser._block);
            const raw = match[1];
            const key = match[2];
            const scripts = [];
            let value = match[3]
                .replace(LangFileParser._comments, '')
                .replace(LangFileParser._outerNewLines, '')
                .trim();
            // Process template scripts and replace with script token stubs
            if (LangFileParser._scriptTemplates.test(value)) {
                const templates = value.match(LangFileParser._scriptTemplates);
                for (const script in templates) {
                    const scriptData = templates[script];
                    const functionBody = scriptData.match(LangFileParser._scriptTemplate)[1]
                        || scriptData.match(LangFileParser._scriptTemplate)[2];
                    scripts.push(new CompiledTemplateScript_1.CompiledTemplateScript(functionBody));
                    value = value.replace(templates[script], `{{! ${script} !}}`);
                }
            }
            lang.strings[key] = new LangStringNode_1.LangStringNode(langName, key, value, raw, scripts);
        }
        return lang;
    }
}
LangFileParser._block = /(\[(\w+)\]\n([\s\S]*?))(?=\n\n+?(?:## *.*\n)*\[\w+\]\n.+|\n*?$)/;
LangFileParser._blocks = new RegExp(LangFileParser._block, 'g');
LangFileParser._comments = /^(?!$)\s*##.*\n|##.*$/gm;
LangFileParser._outerNewLines = /^\n|\n$/g;
LangFileParser._scriptTemplate = /^{{!([\s\S]+?)!}}[\t ]*?\n?|{{!([\s\S]+?)!}}/m;
LangFileParser._scriptTemplates = new RegExp(LangFileParser._scriptTemplate, 'gm');
exports.LangFileParser = LangFileParser;

//# sourceMappingURL=LangFileParser.js.map
