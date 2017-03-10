import { Bot } from '../../../bot/Bot';
import { Message } from '../../../types/Message';
import { Command } from '../../Command';
import { Middleware } from '../../middleware/Middleware';
import { User } from 'discord.js';

export default class Whitelist extends Command<Bot>
{
	public constructor(bot: Bot)
	{
		super(bot, {
			name: 'whitelist',
			description: 'Remove a user from the command blacklist',
			aliases: ['wl'],
			usage: '<prefix>whitelist <user>, [\'global\']',
			extraHelp: '',
			group: 'base',
			permissions: ['ADMINISTRATOR']
		});

		this.use(Middleware.resolveArgs({ '<user>': 'User' }));
		this.use(Middleware.expect({ '<user>': 'User' }));
	}

	public action(message: Message, [user, global]: [User, string]): Promise<Message | Message[]>
	{
		if (global === 'global')
		{
			if (!this.bot.isOwner(message.author))
				return message.channel.send('Only bot owners may remove a global blacklisting.');

			if (!this.bot.storage.exists(`blacklist/${user.id}`))
				return message.channel.send('That user is not currently globally blacklisted.');

			this.bot.storage.removeItem(`blacklist/${user.id}`);
			this.bot.emit('blacklistRemove', user, true);
			return message.channel.send(`Removed ${user.username}#${user.discriminator} from the global blacklist.`);
		}

		if (!message.guild.storage.settingExists(`blacklist/${user.id}`))
			return message.channel.send('That user is not currently blacklisted in this server.');

		message.guild.storage.removeSetting(`blacklist/${user.id}`);
		this.bot.emit('blacklistRemove', user, false);
		return message.channel.send(`Removed ${user.username}#${user.discriminator} from this server's blacklist.`);
	}
}
