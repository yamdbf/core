"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const Command_1 = require("../Command");
const CommandDecorators_1 = require("../CommandDecorators");
const Middleware_1 = require("../middleware/Middleware");
const Util_1 = require("../../util/Util");
const util_1 = require("util");
// @ts-ignore - Exposed for eval:ts command invocations
const Discord = require('discord.js');
// @ts-ignore - Exposed for eval:ts command invocations
const Yamdbf = require('../../index');
let ts;
try {
    ts = require('typescript');
}
catch (_a) { }
class CompilerError extends Error {
    constructor(message) {
        super(message);
        this.name = 'CompilerError';
    }
}
class default_1 extends Command_1.Command {
    constructor() {
        super({
            name: 'eval:ts',
            desc: 'Evaluate provided Typescript code',
            usage: '<prefix>eval:ts <...code>',
            info: 'Runs pretty slowly due to having to run diagnostics before compiling. If Typescript is not installed the provided code will be evaluated as Javascript and diagnostics/compilation will be skipped.',
            ownerOnly: true
        });
    }
    async action(message, [res]) {
        // @ts-ignore - Exposed for eval command invocations
        const client = this.client;
        const [, , prefix, name] = await Util_1.Util.wasCommandCalled(message);
        const call = new RegExp(`^${Util_1.Util.escape(prefix)} *${name}`);
        const code = message.content.replace(call, '').trim();
        if (!code)
            return this.respond(message, res.CMD_EVAL_ERR_NOCODE());
        let start = ts ? await this.respond(message, '*Compiling...*') : message;
        let evaled;
        try {
            const compiled = this._compile(code);
            evaled = await eval(compiled);
        }
        catch (err) {
            return start.edit(res.CMD_EVAL_ERROR({ code, error: this._clean(err) }));
        }
        if (typeof evaled !== 'string')
            evaled = util_1.inspect(evaled, { depth: 0 });
        return start.edit(res.CMD_EVAL_RESULT({ code, result: this._clean(evaled) }));
    }
    _compile(code) {
        let message;
        if (ts) {
            const fileName = `${__dirname}/eval${Date.now()}.ts`;
            fs.writeFileSync(fileName, code);
            const program = ts.createProgram([fileName], { module: ts.ModuleKind.CommonJS });
            let diagnostics = ts.getPreEmitDiagnostics(program);
            if (diagnostics.length > 0) {
                diagnostics = diagnostics.map(d => {
                    const messageText = ts.flattenDiagnosticMessageText(d.messageText, '\n');
                    const { line, character } = d.file.getLineAndCharacterOfPosition(d.start);
                    return `\n(${line + 1},${character + 1}): ${messageText} (${d.code})`;
                })
                    .filter(d => !d.includes('Cannot find name'));
                if (diagnostics.length > 0)
                    message = diagnostics.join('');
            }
            fs.unlinkSync(fileName);
        }
        if (message)
            throw new CompilerError(message);
        return ts
            ? ts.transpileModule(code, { compilerOptions: { module: ts.ModuleKind.CommonJS } })
                .outputText
                .replace('"use strict";\r\nexports.__esModule = true;\r\n', '')
            : code;
    }
    _clean(text) {
        return typeof text === 'string' ? text
            .replace(/`/g, `\`${String.fromCharCode(8203)}`)
            .replace(/@/g, `@${String.fromCharCode(8203)}`)
            .replace(/[\w\d]{24}\.[\w\d]{6}\.[\w\d-_]{27}/g, '[REDACTED]')
            .replace(/email: '[^']+'/g, `email: '[REDACTED]'`)
            : text;
    }
}
__decorate([
    CommandDecorators_1.using(Middleware_1.Middleware.localize)
], default_1.prototype, "action", null);
exports.default = default_1;

//# sourceMappingURL=EvalTS.js.map
