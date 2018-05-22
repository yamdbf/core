"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Resolver_1 = require("../Resolver");
const Lang_1 = require("../../../localization/Lang");
const discord_js_1 = require("discord.js");
const Util_1 = require("../../../util/Util");
class RoleResolver extends Resolver_1.Resolver {
    constructor(client) {
        super(client, 'Role');
    }
    async validate(value) {
        return value instanceof discord_js_1.Role;
    }
    async resolveRaw(value, context = {}) {
        if (!context.guild)
            throw new Error('Cannot resolve given value: missing context');
        let role;
        const roleRegex = /^(?:<@&)?(\d+)>?$/;
        if (roleRegex.test(value)) {
            const id = value.match(roleRegex)[1];
            role = context.guild.roles.get(id);
            if (!role)
                return;
        }
        else {
            const normalized = Util_1.Util.normalize(value);
            let roles = context.guild.roles.filter(a => Util_1.Util.normalize(a.name).includes(normalized));
            if (roles.size === 1)
                role = roles.first();
            else
                return roles;
        }
        return role;
    }
    async resolve(message, command, name, value) {
        const lang = await Lang_1.Lang.getLangFromMessage(message);
        const res = Lang_1.Lang.createResourceProxy(lang);
        const dm = message.channel.type !== 'text';
        const prefix = !dm ? await message.guild.storage.settings.get('prefix') : '';
        const usage = Lang_1.Lang.getCommandInfo(command, lang).usage.replace(/<prefix>/g, prefix);
        const roleRegex = /^(?:<@&)?(\d+)>?$/;
        let role = (await this.resolveRaw(value, message));
        if (roleRegex.test(value)) {
            if (!role)
                throw new Error(res.RESOLVE_ERR_RESOLVE_TYPE_ID({ name, arg: value, usage, type: 'Role' }));
        }
        else {
            if (role instanceof discord_js_1.Collection) {
                if (role.size > 1)
                    throw String(res.RESOLVE_ERR_MULTIPLE_ROLE_RESULTS({
                        name,
                        usage,
                        roles: role.map(r => `\`${r.name}\``).join(', ')
                    }));
                role = role.first();
            }
            if (!role)
                throw new Error(res.RESOLVE_ERR_RESOLVE_TYPE_TEXT({ name, arg: value, usage, type: 'Role' }));
        }
        return role;
    }
}
exports.RoleResolver = RoleResolver;

//# sourceMappingURL=RoleResolver.js.map
