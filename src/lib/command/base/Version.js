'use babel';
'use strict';

import Command from '../Command';

export default class Version extends Command
{
	constructor(bot)
	{
		super(bot, {
			name: 'version',
			aliases: ['v'],
			description: 'Get the version of the bot',
			usage: `<prefix>version`,
			group: 'base',
			guildOnly: false
		});
	}

	async action(message)
	{
		message.channel.sendMessage(`Current version is: **${this.bot.version}**`)
			.then(response =>
			{
				response.delete(5 * 1000);
			});
	}
}
