"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const Resolver_1 = require("../Resolver");
const Lang_1 = require("../../../localization/Lang");
const Util_1 = require("../../../util/Util");
class UserResolver extends Resolver_1.Resolver {
    constructor(client) {
        super(client, 'User');
    }
    async validate(value) {
        return value instanceof discord_js_1.User;
    }
    async resolveRaw(value, context = {}) {
        let user;
        const idRegex = /^(?:<@!?)?(\d+)>?$/;
        if (idRegex.test(value)) {
            try {
                const userID = value.match(idRegex)[1];
                user = this.client.users.get(userID) || await this.client.users.fetch(userID);
            }
            catch (_a) { }
            if (!user)
                return;
        }
        else {
            const normalized = Util_1.Util.normalize(value);
            let users = this.client.users.filter(a => Util_1.Util.normalize(a.username).includes(normalized)
                || Util_1.Util.normalize(a.tag).includes(normalized));
            if (context.guild)
                users = users.concat(new discord_js_1.Collection(context.guild.members
                    .filter(a => Util_1.Util.normalize(a.displayName).includes(normalized))
                    .map(a => [a.id, a.user])));
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
                throw new Error(res.RESOLVE_ERR_RESOLVE_TYPE_ID({ name, arg: value, usage, type: 'User' }));
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
                throw new Error(res.RESOLVE_ERR_RESOLVE_TYPE_TEXT({ name, arg: value, usage, type: 'User' }));
        }
        return user;
    }
}
exports.UserResolver = UserResolver;

//# sourceMappingURL=UserResolver.js.map
