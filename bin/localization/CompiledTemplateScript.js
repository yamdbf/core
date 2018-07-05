"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vm_1 = require("vm");
/**
 * A compiled localization template script, including an implicit
 * return coercion if it was syntactically possible to create one
 * @private
 */
class CompiledTemplateScript {
    constructor(raw) {
        this.raw = raw;
        // Defer syntax error handling to the vm Script because
        // it will actually detail the code in question in the error
        try {
            this.func = new Function('args', 'res', raw);
        }
        catch (_a) { }
        // Because --noUnusedLocals, no-unused-expression, and I dislike
        // disabling tslint and TypeScript errors. Don't judge me.
        this.func._testScript = new vm_1.Script(CompiledTemplateScript._functionWrap(raw));
        delete this.func._testScript;
        // Attempt to create the coerced implicit return function
        try {
            const functionBody = `return ${raw.replace(/^[\s]+/, '')}`;
            const implicitReturnFunc = new Function('args', 'res', functionBody);
            this.implicitReturnFunc = implicitReturnFunc;
        }
        catch (_b) { }
    }
    /**
     * Wrap the given code in a function body to prevent vm.Script
     * throwing errors on top-level returns which are valid in the
     * context of a template script
     */
    static _functionWrap(code) {
        return `function _(args, res) {\n${code}\n}`;
    }
}
exports.CompiledTemplateScript = CompiledTemplateScript;

//# sourceMappingURL=CompiledTemplateScript.js.map
