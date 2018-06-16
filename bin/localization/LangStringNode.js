"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Represents a localization string parsed and compiled from a .lang file
 * @private
 */
class LangStringNode {
    constructor(key, value, raw, scripts) {
        this.key = key;
        this.value = value;
        this.raw = raw;
        this.scripts = scripts;
    }
}
exports.LangStringNode = LangStringNode;

//# sourceMappingURL=LangStringNode.js.map
