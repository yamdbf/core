"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Resolver_1 = require("../Resolver");
const Lang_1 = require("../../../localization/Lang");
const util_1 = require("util");
class BooleanResolver extends Resolver_1.Resolver {
    constructor(client) {
        super(client, 'Boolean', 'boolean');
        this.truthy = new Set(['true', 'on', 'y', 'yes', 'enable']);
        this.falsey = new Set(['false', 'off', 'n', 'no', 'disable']);
    }
    validate(value) {
        return util_1.isBoolean(value);
    }
    resolveRaw(value) {
        value = value.toLowerCase();
        if (this.truthy.has(value))
            return true;
        if (this.falsey.has(value))
            return false;
    }
    async resolve(message, command, name, value) {
        const lang = await Lang_1.Lang.getLangFromMessage(message);
        const res = Lang_1.Lang.createResourceProxy(lang);
        const dm = message.channel.type !== 'text';
        const prefix = !dm ? await message.guild.storage.settings.get('prefix') : '';
        const usage = Lang_1.Lang.getCommandInfo(command, lang).usage.replace(/<prefix>/g, prefix);
        const result = this.resolveRaw(value);
        if (!(this.validate(result)))
            throw new Error(res.RESOLVE_ERR_RESOLVE_BOOLEAN({ name, arg: value, usage }));
        return result;
    }
}
exports.BooleanResolver = BooleanResolver;

//# sourceMappingURL=BooleanResolver.js.map
