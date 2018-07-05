"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../Command");
const CommandDecorators_1 = require("../CommandDecorators");
const Middleware_1 = require("../middleware/Middleware");
const Util_1 = require("../../util/Util");
const util_1 = require("util");
// @ts-ignore - Exposed for eval command invocations
const Discord = require('discord.js');
// @ts-ignore - Exposed for eval command invocations
const Yamdbf = require('../../index');
class default_1 extends Command_1.Command {
    constructor() {
        super({
            name: 'eval',
            desc: 'Evaluate provided Javascript code',
            usage: '<prefix>eval <...code>',
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
        let evaled;
        let error;
        try {
            evaled = await eval(code);
        }
        catch (err) {
            error = err;
        }
        if (error)
            return this.respond(message, res.CMD_EVAL_ERROR({ code, error: this._clean(error) }));
        if (typeof evaled !== 'string')
            evaled = util_1.inspect(evaled, { depth: 0 });
        return this.respond(message, res.CMD_EVAL_RESULT({ code, result: this._clean(evaled) }));
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

//# sourceMappingURL=Eval.js.map
