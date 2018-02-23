"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Resolver_1 = require("../Resolver");
const Lang_1 = require("../../../localization/Lang");
const BaseStrings_1 = require("../../../localization/BaseStrings");
const Util_1 = require("../../../util/Util");
class CommandGroupResolver extends Resolver_1.Resolver {
    constructor(client) {
        super(client, 'CommandGroup');
    }
    async validate(value) {
        return this.client.commands.groups.includes(value);
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
        const result = this.client.commands.groups
            .find(g => Util_1.Util.normalize(g).includes(Util_1.Util.normalize(value)));
        if (!result)
            throw new Error(res(BaseStrings_1.BaseStrings.RESOLVE_ERR_RESOLVE_TYPE_TEXT, { name, arg: value, usage, type: 'CommandGroup' }));
        return result;
    }
}
exports.CommandGroupResolver = CommandGroupResolver;

//# sourceMappingURL=CommandGroupResolver.js.map
