"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Resolver_1 = require("../Resolver");
const Lang_1 = require("../../../localization/Lang");
const BaseStrings_1 = require("../../../localization/BaseStrings");
const Time_1 = require("../../../util/Time");
class DurationResolver extends Resolver_1.Resolver {
    constructor(client) {
        super(client, 'Duration');
    }
    async validate(value) {
        return typeof value === 'number' && !isNaN(value) && isFinite(value);
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
        const result = Time_1.Time.parseShorthand(value);
        if (!result)
            throw new Error(res(BaseStrings_1.BaseStrings.RESOLVE_ERR_RESOLVE_DURATION, { name, arg: value, usage }));
        return result;
    }
}
exports.DurationResolver = DurationResolver;

//# sourceMappingURL=DurationResolver.js.map
