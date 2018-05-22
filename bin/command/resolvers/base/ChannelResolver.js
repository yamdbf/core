"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Resolver_1 = require("../Resolver");
const Lang_1 = require("../../../localization/Lang");
const discord_js_1 = require("discord.js");
const Util_1 = require("../../../util/Util");
class ChannelResolver extends Resolver_1.Resolver {
    constructor(client) {
        super(client, 'Channel', 'TextChannel');
    }
    validate(value) {
        return value instanceof discord_js_1.TextChannel;
    }
    async resolveRaw(value, context = {}) {
        if (!context.guild)
            throw new Error('Cannot resolve given value: missing context');
        let channel;
        const channelRegex = /^(?:<#)?(\d+)>?$/;
        if (channelRegex.test(value)) {
            const id = value.match(channelRegex)[1];
            channel = context.guild.channels.get(id);
            if (!channel)
                return;
        }
        else {
            const normalized = Util_1.Util.normalize(value);
            const channels = context.guild.channels
                .filter(a => a.type === 'text')
                .filter(a => Util_1.Util.normalize(a.name).includes(normalized));
            if (channels.size === 1)
                channel = channels.first();
            else
                return channels;
        }
        return channel;
    }
    async resolve(message, command, name, value) {
        const lang = await Lang_1.Lang.getLangFromMessage(message);
        const res = Lang_1.Lang.createResourceProxy(lang);
        const dm = message.channel.type !== 'text';
        const prefix = !dm ? await message.guild.storage.settings.get('prefix') : '';
        const usage = Lang_1.Lang.getCommandInfo(command, lang).usage.replace(/<prefix>/g, prefix);
        const channelRegex = /^(?:<#)?(\d+)>?$/;
        let channel = (await this.resolveRaw(value, message));
        if (channelRegex.test(value)) {
            if (!channel)
                throw new Error(res.RESOLVE_ERR_RESOLVE_TYPE_ID({ name, arg: value, usage, type: 'Channel' }));
        }
        else {
            if (channel instanceof discord_js_1.Collection) {
                if (channel.size > 1)
                    throw String(res.RESOLVE_ERR_MULTIPLE_CHANNEL_RESULTS({
                        name,
                        usage,
                        channels: channel.map(c => `\`#${c.name}\``).join(', ')
                    }));
                channel = channel.first();
            }
            if (!channel)
                throw new Error(res.RESOLVE_ERR_RESOLVE_TYPE_TEXT({ name, arg: value, usage, type: 'Channel' }));
        }
        return channel;
    }
}
exports.ChannelResolver = ChannelResolver;

//# sourceMappingURL=ChannelResolver.js.map
