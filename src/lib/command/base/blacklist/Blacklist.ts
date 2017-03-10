import { Bot } from '../../../bot/Bot';
import { Message } from '../../../types/Message';
import { Command } from '../../Command';
import { Middleware } from '../../middleware/Middleware';
import { User } from 'discord.js';

export default class Blacklist extends Command<Bot>
{
	public constructor(bot: Bot)
	{
		super(bot, {
			name: 'blacklist',
			description: 'Blacklist a user from calling commands',
			aliases: ['bl'],
			usage: '<prefix>blacklist <user>, [\'global\']',
			extraHelp: 'If global, this will block the user from calling commands in ANY server and DMs',
			group: 'base',
			permissions: ['ADMINISTRATOR']
		});

		this.use(Middleware.resolveArgs({ '<user>': 'User' }));
		this.use(Middleware.expect({ '<user>': 'User' }));
	}

	public async action(message: Message, [user, global]: [User, string]): Promise<Message | Message[]>
	{
		if (user.id === message.author.id)
			return message.channel.send(`I don't think you want to blacklist yourself.`);

		if (user.bot) return message.channel.send(
			`Bots already cannot call commands and do not need to be blacklisted.`);

		if (global === 'global')
		{
			if (!this.bot.isOwner(message.author))
				return message.channel.send('Only bot owners may blacklist globally.');

			if (this.bot.storage.exists(`blacklist/${user.id}`))
				return message.channel.send('That user is already globally blacklisted.');

			this.bot.storage.setItem(`blacklist/${user.id}`, true);
			this.bot.emit('blacklistAdd', user, true);
			return message.channel.send(`Added ${user.username}#${user.discriminator} to the global blacklist.`);
		}

		if ((await message.guild.fetchMember(user)).hasPermission('ADMINISTRATOR'))
			return message.channel.send('You may not use this command on that person.');

		if (message.guild.storage.settingExists(`blacklist/${user.id}`))
			return message.channel.send('That user is already blacklisted in this server.');

		message.guild.storage.setSetting(`blacklist/${user.id}`, true);
		this.bot.emit('blacklistAdd', user, false);
		return message.channel.send(`Added ${user.username}#${user.discriminator} to this server's blacklist.`);
	}
}
