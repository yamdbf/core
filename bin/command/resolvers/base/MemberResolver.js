"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Resolver_1 = require("../Resolver");
const Lang_1 = require("../../../localization/Lang");
const discord_js_1 = require("discord.js");
const Util_1 = require("../../../util/Util");
class MemberResolver extends Resolver_1.Resolver {
    constructor(client) {
        super(client, 'Member', 'GuildMember');
    }
    async validate(value) {
        return value instanceof discord_js_1.GuildMember;
    }
    async resolveRaw(value, context = {}) {
        if (!context.guild)
            throw new Error('Cannot resolve given value: missing context');
        let member;
        const idRegex = /^(?:<@!?)?(\d+)>?$/;
        if (idRegex.test(value)) {
            try {
                const userID = value.match(idRegex)[1];
                member = context.guild.members.get(userID) || await context.guild.members.fetch(userID);
            }
            catch (_a) { }
            if (!member)
                return;
        }
        else {
            const normalized = Util_1.Util.normalize(value);
            let members = context.guild.members.filter(a => Util_1.Util.normalize(a.displayName).includes(normalized)
                || Util_1.Util.normalize(a.user.username).includes(normalized)
                || Util_1.Util.normalize(a.user.tag).includes(normalized));
            if (members.size === 1)
                member = members.first();
            else
                return members;
        }
        return member;
    }
    async resolve(message, command, name, value) {
        const lang = await Lang_1.Lang.getLangFromMessage(message);
        const res = Lang_1.Lang.createResourceProxy(lang);
        const dm = message.channel.type !== 'text';
        const prefix = !dm ? await message.guild.storage.settings.get('prefix') : '';
        const usage = Lang_1.Lang.getCommandInfo(command, lang).usage.replace(/<prefix>/g, prefix);
        const idRegex = /^(?:<@!?)?(\d+)>?$/;
        let member = (await this.resolveRaw(value, message));
        if (idRegex.test(value)) {
            if (!member)
                throw new Error(res.RESOLVE_ERR_RESOLVE_TYPE_ID({ name, arg: value, usage, type: 'Member' }));
        }
        else {
            if (member instanceof discord_js_1.Collection) {
                if (member.size > 1)
                    throw String(res.RESOLVE_ERR_MULTIPLE_USER_RESULTS({
                        name,
                        usage,
                        users: member.map(m => `\`${m.user.tag}\``).join(', ')
                    }));
                member = member.first();
            }
            if (!member)
                throw new Error(res.RESOLVE_ERR_RESOLVE_TYPE_TEXT({ name, arg: value, usage, type: 'Member' }));
        }
        return member;
    }
}
exports.MemberResolver = MemberResolver;

//# sourceMappingURL=MemberResolver.js.map
