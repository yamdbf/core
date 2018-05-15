"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Resolver_1 = require("../Resolver");
const Lang_1 = require("../../../localization/Lang");
class NumberResolver extends Resolver_1.Resolver {
    constructor(client) {
        super(client, 'Number', 'number');
    }
    validate(value) {
        return typeof value === 'number' && !isNaN(value) && isFinite(value);
    }
    resolveRaw(value) {
        return parseFloat(value);
    }
    async resolve(message, command, name, value) {
        const lang = await Lang_1.Lang.getLangFromMessage(message);
        const res = Lang_1.Lang.createResourceProxy(lang);
        const dm = message.channel.type !== 'text';
        const prefix = !dm ? await message.guild.storage.settings.get('prefix') : '';
        const usage = Lang_1.Lang.getCommandInfo(command, lang).usage.replace(/<prefix>/g, prefix);
        const result = this.resolveRaw(value);
        if (!(this.validate(result)))
            throw new Error(res.RESOLVE_ERR_RESOLVE_NUMBER({ name, arg: value, usage }));
        return result;
    }
}
exports.NumberResolver = NumberResolver;

//# sourceMappingURL=NumberResolver.js.map
