import { Bot } from '../../../bot/Bot';
import { Message } from '../../../types/Message';
import { Command } from '../../Command';
import { Middleware } from '../../middleware/Middleware';
import { User } from 'discord.js';
import * as CommandDecorators from '../../CommandDecorators';
const { using } = CommandDecorators;

export default class Whitelist extends Command<Bot>
{
	public constructor(bot: Bot)
	{
		super(bot, {
			name: 'whitelist',
			description: 'Remove a user from the command blacklist',
			aliases: ['wl'],
			usage: '<prefix>whitelist <user>, [\'global\']',
			permissions: ['ADMINISTRATOR']
		});
	}

	@using(Middleware.resolveArgs({ '<user>': 'User' }))
	@using(Middleware.expect({ '<user>': 'User' }))
	public async action(message: Message, [user, global]: [User, string]): Promise<Message | Message[]>
	{
		if (global === 'global')
		{
			if (!this.bot.isOwner(message.author))
				return message.channel.send('Only bot owners may remove a global blacklisting.');

			const globalBlacklist: any = await this.bot.storage.get('blacklist') || {};
			if (!globalBlacklist[user.id])
				return message.channel.send('That user is not currently globally blacklisted.');

			await this.bot.storage.remove(`blacklist.${user.id}`);
			this.bot.emit('blacklistRemove', user, true);
			return message.channel.send(`Removed ${user.username}#${user.discriminator} from the global blacklist.`);
		}

		const guildBlacklist: any = message.guild.storage.settings.get('blacklist') || {};
		if (!guildBlacklist[user.id])
			return message.channel.send('That user is not currently blacklisted in this server.');

		message.guild.storage.settings.remove(`blacklist.${user.id}`);
		this.bot.emit('blacklistRemove', user, false);
		return message.channel.send(`Removed ${user.username}#${user.discriminator} from this server's blacklist.`);
	}
}
