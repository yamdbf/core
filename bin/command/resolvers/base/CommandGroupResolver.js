"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Resolver_1 = require("../Resolver");
const Lang_1 = require("../../../localization/Lang");
const Util_1 = require("../../../util/Util");
class CommandGroupResolver extends Resolver_1.Resolver {
    constructor(client) {
        super(client, 'CommandGroup');
    }
    validate(value) {
        return this.client.commands.groups.includes(value);
    }
    resolveRaw(value) {
        return this.client.commands.groups
            .find(g => Util_1.Util.normalize(g).includes(Util_1.Util.normalize(value)));
    }
    async resolve(message, command, name, value) {
        const lang = await Lang_1.Lang.getLangFromMessage(message);
        const res = Lang_1.Lang.createResourceProxy(lang);
        const dm = message.channel.type !== 'text';
        const prefix = !dm ? await message.guild.storage.settings.get('prefix') : '';
        const usage = Lang_1.Lang.getCommandInfo(command, lang).usage.replace(/<prefix>/g, prefix);
        const result = this.resolveRaw(value);
        if (!result)
            throw new Error(res.RESOLVE_ERR_RESOLVE_TYPE_TEXT({ name, arg: value, usage, type: 'CommandGroup' }));
        return result;
    }
}
exports.CommandGroupResolver = CommandGroupResolver;

//# sourceMappingURL=CommandGroupResolver.js.map
