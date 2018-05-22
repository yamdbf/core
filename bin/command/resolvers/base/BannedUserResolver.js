"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Resolver_1 = require("../Resolver");
const Lang_1 = require("../../../localization/Lang");
const discord_js_1 = require("discord.js");
const Util_1 = require("../../../util/Util");
class BannedUserResolver extends Resolver_1.Resolver {
    constructor(client) {
        super(client, 'BannedUser');
    }
    validate(value) {
        return value instanceof discord_js_1.User;
    }
    async resolveRaw(value, context = {}) {
        if (!context.guild)
            throw new Error('Cannot resolve given value: missing context');
        let user;
        const idRegex = /^(?:<@!?)?(\d+)>?$/;
        const bans = await context.guild.fetchBans();
        const bannedUsers = new discord_js_1.Collection(bans.map(b => [b.user.id, b.user]));
        if (idRegex.test(value)) {
            user = bannedUsers.get(value.match(idRegex)[1]);
            if (!user)
                return;
        }
        else {
            const normalized = Util_1.Util.normalize(value);
            let users = bannedUsers.filter(a => Util_1.Util.normalize(a.username).includes(normalized)
                || Util_1.Util.normalize(a.tag).includes(normalized));
            if (users.size === 1)
                user = users.first();
            else
                return users;
        }
        return user;
    }
    async resolve(message, command, name, value) {
        const lang = await Lang_1.Lang.getLangFromMessage(message);
        const res = Lang_1.Lang.createResourceProxy(lang);
        const dm = message.channel.type !== 'text';
        const prefix = !dm ? await message.guild.storage.settings.get('prefix') : '';
        const usage = Lang_1.Lang.getCommandInfo(command, lang).usage.replace(/<prefix>/g, prefix);
        const idRegex = /^(?:<@!?)?(\d+)>?$/;
        let user = (await this.resolveRaw(value, message));
        if (idRegex.test(value)) {
            if (!user)
                throw new Error(res.RESOLVE_ERR_RESOLVE_TYPE_ID({ name, arg: value, usage, type: 'BannedUser' }));
        }
        else {
            if (user instanceof discord_js_1.Collection) {
                if (user.size > 1)
                    throw String(res.RESOLVE_ERR_MULTIPLE_USER_RESULTS({
                        name,
                        usage,
                        users: user.map(u => `\`${u.tag}\``).join(', ')
                    }));
                user = user.first();
            }
            if (!user)
                throw new Error(res.RESOLVE_ERR_RESOLVE_TYPE_TEXT({ name, arg: value, usage, type: 'BannedUser' }));
        }
        return user;
    }
}
exports.BannedUserResolver = BannedUserResolver;

//# sourceMappingURL=BannedUserResolver.js.map
