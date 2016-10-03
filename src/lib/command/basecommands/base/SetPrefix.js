'use babel';
'use strict';

import Command from '../../Command';

export default class SetPrefix extends Command
{
	constructor(bot)
	{
		super(bot, {
			name: 'setprefix',
			description: 'Set the bot command prefix for this guild.',
			aliases: ['prefix'],
			usage: `<prefix>setprefix`,
			group: 'base',
			guildOnly: true,
			permissions: ['ADMINISTRATOR'],
			ownerOnly: false,
			command: /^(?:setprefix|prefix)(?: (.+))?$/
		});
	}

	async action(message, args, mentions) // eslint-disable-line no-unused-vars
	{
		if (!args[0])
		{
			message.channel.sendMessage(`You must provide a prefix to set. Prefixes may be up to 10 chars in length.`)
				.then(response =>
				{
					response.delete(5 * 1000);
				});
			return;
		}
		if (args[0].length > 10)
		{
			message.channel.sendMessage(`Prefixes may only be up to 10 chars in length.`)
				.then(response =>
				{
					response.delete(5 * 1000);
				});
			return;
		}
		if (/[\\`]/.test(args[0]))
		{
			message.channel.sendMessage(`Prefixes may not contain backticks or backslashes.`)
				.then(response =>
				{
					response.delete(5 * 1000);
				});
			return;
		}

		this.bot.guildStorages.get(message.guild).setSetting('prefix', args[0]);
		message.channel.sendMessage(`Command prefix set to "${args[0]}"`)
			.then(response =>
			{
				response.delete(5 * 1000);
			});
	}
}
