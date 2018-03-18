import { Resolver } from '../Resolver';
import { Client } from '../../../client/Client';
import { Command } from '../../Command';
import { Message } from '../../../types/Message';
import { Lang } from '../../../localization/Lang';
import { ResourceProxy } from '../../../types/ResourceProxy';
import { TextChannel, Collection } from 'discord.js';
import { Util } from '../../../util/Util';

export class ChannelResolver extends Resolver
{
	public constructor(client: Client)
	{
		super(client, 'Channel', 'TextChannel');
	}

	public async validate(value: any): Promise<boolean>
	{
		return value instanceof TextChannel;
	}

	public async resolve(message: Message, command: Command, name: string, value: string): Promise<TextChannel>
	{
		const lang: string = await Lang.getLangFromMessage(message);
		const res: ResourceProxy = Lang.createResourceProxy(lang);

		const dm: boolean = message.channel.type !== 'text';
		const prefix: string = !dm ? await message.guild.storage.settings.get('prefix') : '';
		const usage: string = Lang.getCommandInfo(command, lang).usage.replace(/<prefix>/g, prefix);

		const channelRegex: RegExp = /^(?:<#)?(\d+)>?$/;

		let channel: TextChannel;
		if (channelRegex.test(value))
		{
			const id: string = value.match(channelRegex)[1];
			channel = <TextChannel> message.guild.channels.get(id);
			if (!channel)
				throw new Error(res.RESOLVE_ERR_RESOLVE_TYPE_ID({ name, arg: value, usage, type: 'Channel' }));
		}
		else
		{
			const normalized: string = Util.normalize(value);
			const channels: Collection<string, TextChannel> =
				(<Collection<string, TextChannel>> message.guild.channels)
					.filter(a => a.type === 'text')
					.filter(a => Util.normalize(a.name).includes(normalized));

			if (channels.size > 1)
				throw String(res.RESOLVE_ERR_MULTIPLE_CHANNEL_RESULTS({
					name,
					usage,
					channels: channels.map(c => `\`#${c.name}\``).join(', ')
				}));

			channel = channels.first();
			if (!channel)
				throw new Error(res.RESOLVE_ERR_RESOLVE_TYPE_TEXT({ name, arg: value, usage, type: 'Channel' }));
		}

		return channel;
	}
}
