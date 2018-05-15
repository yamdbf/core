"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Resolver_1 = require("../Resolver");
const Command_1 = require("../../Command");
const Lang_1 = require("../../../localization/Lang");
class CommandResolver extends Resolver_1.Resolver {
    constructor(client) {
        super(client, 'Command');
    }
    validate(value) {
        return value instanceof Command_1.Command;
    }
    resolveRaw(value) {
        return this.client.commands.resolve(value);
    }
    async resolve(message, command, name, value) {
        const lang = await Lang_1.Lang.getLangFromMessage(message);
        const res = Lang_1.Lang.createResourceProxy(lang);
        const dm = message.channel.type !== 'text';
        const prefix = !dm ? await message.guild.storage.settings.get('prefix') : '';
        const usage = Lang_1.Lang.getCommandInfo(command, lang).usage.replace(/<prefix>/g, prefix);
        const result = this.resolveRaw(value);
        if (!result)
            throw new Error(res.RESOLVE_ERR_RESOLVE_TYPE_TEXT({ name, arg: value, usage, type: 'Command' }));
        return result;
    }
}
exports.CommandResolver = CommandResolver;

//# sourceMappingURL=CommandResolver.js.map
