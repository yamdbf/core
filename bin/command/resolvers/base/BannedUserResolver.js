"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Resolver_1 = require("../Resolver");
const Lang_1 = require("../../../localization/Lang");
const discord_js_1 = require("discord.js");
class BannedUserResolver extends Resolver_1.Resolver {
    constructor(client) {
        super(client, 'BannedUser');
    }
    async validate(value) {
        return value instanceof discord_js_1.User;
    }
    async resolve(message, command, name, value) {
        const lang = await Lang_1.Lang.getLangFromMessage(message);
        const res = Lang_1.Lang.createResourceProxy(lang);
        const dm = message.channel.type !== 'text';
        const prefix = !dm ? await message.guild.storage.settings.get('prefix') : '';
        const usage = Lang_1.Lang.getCommandInfo(command, lang).usage.replace(/<prefix>/g, prefix);
        const idRegex = /^(?:<@!?)?(\d+)>?$/;
        const normalizeUser = text => text.toLowerCase().replace(/[^a-z0-9#]+/g, '');
        const bannedUsers = await message.guild.fetchBans();
        let user;
        if (idRegex.test(value)) {
            user = bannedUsers.get(value.match(idRegex)[1]);
            if (!user)
                throw new Error(res.RESOLVE_ERR_RESOLVE_TYPE_ID({ name, arg: value, usage, type: 'BannedUser' }));
        }
        else {
            const normalized = normalizeUser(value);
            let users = bannedUsers.filter(a => normalizeUser(a.username).includes(normalized)
                || normalizeUser(a.tag).includes(normalized));
            if (users.size > 1)
                throw String(res.RESOLVE_ERR_MULTIPLE_USER_RESULTS({
                    name,
                    usage,
                    users: users.map(u => `\`${u.tag}\``).join(', ')
                }));
            user = users.first();
            if (!user)
                throw new Error(res.RESOLVE_ERR_RESOLVE_TYPE_TEXT({ name, arg: value, usage, type: 'BannedUser' }));
        }
        return user;
    }
}
exports.BannedUserResolver = BannedUserResolver;

//# sourceMappingURL=BannedUserResolver.js.map
