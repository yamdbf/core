"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Resolver_1 = require("../Resolver");
const Lang_1 = require("../../../localization/Lang");
const BaseStrings_1 = require("../../../localization/BaseStrings");
const discord_js_1 = require("discord.js");
class MemberResolver extends Resolver_1.Resolver {
    constructor(client) {
        super(client, 'Member', 'GuildMember');
    }
    async validate(value) {
        return value instanceof discord_js_1.GuildMember;
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
        const idRegex = /^(?:<@!?)?(\d+)>?$/;
        const normalizeUser = text => text.toLowerCase().replace(/[^a-z0-9#]+/g, '');
        let member;
        if (idRegex.test(value)) {
            try {
                member = await message.guild.fetchMember(value.match(idRegex)[1]);
            }
            catch (_a) { }
            if (!member)
                throw new Error(res(BaseStrings_1.BaseStrings.RESOLVE_ERR_RESOLVE_TYPE_ID, { name, arg: value, usage, type: 'Member' }));
        }
        else {
            const normalized = normalizeUser(value);
            let members = message.guild.members.filter(a => normalizeUser(a.displayName).includes(normalized)
                || normalizeUser(a.user.username).includes(normalized)
                || normalizeUser(a.user.tag).includes(normalized));
            if (members.size > 1)
                throw String(res(BaseStrings_1.BaseStrings.RESOLVE_ERR_MULTIPLE_USER_RESULTS, { name, usage, users: members.map(m => `\`${m.user.tag}\``).join(', ') }));
            member = members.first();
            if (!member)
                throw new Error(res(BaseStrings_1.BaseStrings.RESOLVE_ERR_RESOLVE_TYPE_TEXT, { name, arg: value, usage, type: 'Member' }));
        }
        return member;
    }
}
exports.MemberResolver = MemberResolver;

//# sourceMappingURL=MemberResolver.js.map
