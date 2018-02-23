"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Resolver_1 = require("../Resolver");
const Command_1 = require("../../Command");
const Lang_1 = require("../../../localization/Lang");
const BaseStrings_1 = require("../../../localization/BaseStrings");
class CommandResolver extends Resolver_1.Resolver {
    constructor(client) {
        super(client, 'Command');
    }
    async validate(value) {
        return value instanceof Command_1.Command;
    }
    async resolve(message, command, name, value) {
        const dm = message.channel.type !== 'text';
        const lang = dm
            ? this.client.defaultLang
            : await message.guild.storage.settings.get('lang')
                || this.client.defaultLang;
        const res = Lang_1.Lang.createResourceLoader(lang);
        const prefix = !dm ? await message.guild.storage.settings.get('prefix') : '';
        const usage = Lang_1.Lang.getCommandInfo(command, lang).usage.replace(/<prefix>/g, prefix);
        const result = this.client.commands.resolve(value);
        if (!result)
            throw new Error(res(BaseStrings_1.BaseStrings.RESOLVE_ERR_RESOLVE_TYPE_TEXT, { name, arg: value, usage, type: 'Command' }));
        return result;
    }
}
exports.CommandResolver = CommandResolver;

//# sourceMappingURL=CommandResolver.js.map
