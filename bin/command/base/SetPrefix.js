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
class default_1 extends Command_1.Command {
    constructor() {
        super({
            name: 'setprefix',
            desc: 'Set or check command prefix',
            aliases: ['prefix'],
            usage: '<prefix>setprefix [prefix]',
            info: 'Prefixes may be 1-10 characters in length and may not include backslashes or backticks. Use "clear" to clear the prefix and allow commands to be called without a prefix.',
            callerPermissions: ['ADMINISTRATOR']
        });
    }
    async action(message, [res, prefix]) {
        if (!prefix)
            return this.respond(message, res.CMD_PREFIX_CURRENT({ prefix: (await this.client.getPrefix(message.guild)) }));
        if (prefix.length > 10)
            return this.respond(message, res.CMD_PREFIX_ERR_CHAR_LIMIT());
        if (/[\\`]/.test(prefix))
            return this.respond(message, res.CMD_PREFIX_ERR_INVALID_CHARS());
        if (prefix === 'clear')
            prefix = '';
        await message.guild.storage.settings.set('prefix', prefix);
        return this.respond(message, res.CMD_PREFIX_SUCCESS({ prefix }));
    }
}
__decorate([
    CommandDecorators_1.using(Middleware_1.Middleware.localize)
], default_1.prototype, "action", null);
exports.default = default_1;

//# sourceMappingURL=SetPrefix.js.map
