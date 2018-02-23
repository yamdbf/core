"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Resolver_1 = require("../Resolver");
const Lang_1 = require("../../../localization/Lang");
const BaseStrings_1 = require("../../../localization/BaseStrings");
const discord_js_1 = require("discord.js");
const Util_1 = require("../../../util/Util");
class ChannelResolver extends Resolver_1.Resolver {
    constructor(client) {
        super(client, 'Channel', 'TextChannel');
    }
    async validate(value) {
        return value instanceof discord_js_1.TextChannel;
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
        const channelRegex = /^(?:<#)?(\d+)>?$/;
        let channel;
        if (channelRegex.test(value)) {
            const id = value.match(channelRegex)[1];
            channel = message.guild.channels.get(id);
            if (!channel)
                throw new Error(res(BaseStrings_1.BaseStrings.RESOLVE_ERR_RESOLVE_TYPE_ID, { name, arg: value, usage, type: 'Channel' }));
        }
        else {
            const normalized = Util_1.Util.normalize(value);
            const channels = message.guild.channels
                .filter(a => a.type === 'text')
                .filter(a => Util_1.Util.normalize(a.name).includes(normalized));
            if (channels.size > 1)
                throw String(res(BaseStrings_1.BaseStrings.RESOLVE_ERR_MULTIPLE_CHANNEL_RESULTS, { name, usage, channels: channels.map(c => `\`#${c.name}\``).join(', ') }));
            channel = channels.first();
            if (!channel)
                throw new Error(res(BaseStrings_1.BaseStrings.RESOLVE_ERR_RESOLVE_TYPE_TEXT, { name, arg: value, usage, type: 'Channel' }));
        }
        return channel;
    }
}
exports.ChannelResolver = ChannelResolver;

//# sourceMappingURL=ChannelResolver.js.map
