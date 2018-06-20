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

	public validate(value: any): boolean
	{
		return value instanceof TextChannel;
	}

	public async resolveRaw(value: string, context: Partial<Message> = {}): Promise<TextChannel | Collection<string, TextChannel> | undefined>
	{
		if (!context.guild) throw new Error('Cannot resolve given value: missing context');

		let channel: TextChannel;
		const channelRegex: RegExp = /^(?:<#)?(\d+)>?$/;

		if (channelRegex.test(value))
		{
			const id: string = value.match(channelRegex)![1];
			channel = context.guild.channels.get(id) as TextChannel;
			if (!channel) return;
		}
		else
		{
			const normalized: string = Util.normalize(value);
			const channels: Collection<string, TextChannel> =
				context.guild.channels
					.filter(a => a.type === 'text')
					.filter(a => Util.normalize(a.name).includes(normalized)) as Collection<string, TextChannel>;

			if (channels.size === 1) channel = channels.first()!;
			else return channels;
		}

		return channel;
	}

	public async resolve(message: Message, command: Command, name: string, value: string): Promise<TextChannel>
	{
		const lang: string = await Lang.getLangFromMessage(message);
		const res: ResourceProxy = Lang.createResourceProxy(lang);

		const dm: boolean = message.channel.type !== 'text';
		const prefix: string = !dm ? await message.guild.storage!.settings.get('prefix') : '';
		const usage: string = Lang.getCommandInfo(command, lang).usage.replace(/<prefix>/g, prefix);

		const channelRegex: RegExp = /^(?:<#)?(\d+)>?$/;

		let channel: TextChannel | Collection<string, TextChannel> = (await this.resolveRaw(value, message))!;
		if (channelRegex.test(value))
		{
			if (!channel)
				throw new Error(res.RESOLVE_ERR_RESOLVE_TYPE_ID({ name, arg: value, usage, type: 'Channel' }));
		}
		else
		{
			if (channel instanceof Collection)
			{
				if (channel.size > 1)
					throw String(res.RESOLVE_ERR_MULTIPLE_CHANNEL_RESULTS({
						name,
						usage,
						channels: channel.map(c => `\`#${c.name}\``).join(', ')
					}));

				channel = channel.first()!;
			}

			if (!channel)
				throw new Error(res.RESOLVE_ERR_RESOLVE_TYPE_TEXT({ name, arg: value, usage, type: 'Channel' }));
		}

		return channel as TextChannel;
	}
}
