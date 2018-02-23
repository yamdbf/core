"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Holds the localization strings for a given language
 * @private
 */
class Language {
    constructor(name) {
        this.name = name;
        this.strings = {};
        this.raw = {};
    }
    /**
     * Concatenate another Language object's strings of the
     * same language with this Language object's strings,
     * saving them to this Language object's `strings` value
     */
    concat(lang) {
        if (lang.name !== this.name)
            throw new Error('Cannot concatenate strings for different languages.');
        this.strings = Object.assign({}, this.strings, lang.strings);
        this.raw = Object.assign({}, this.raw, lang.raw);
    }
}
exports.Language = Language;

//# sourceMappingURL=Language.js.map
