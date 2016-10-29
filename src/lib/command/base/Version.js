'use babel';
'use strict';

import Command from '../Command';

export default class Version extends Command
{
	constructor(bot)
	{
		super(bot, {
			name: 'version',
			aliases: [],
			description: 'Get the version of the bot',
			usage: `<prefix>version`,
			group: 'base',
			guildOnly: false
		});
	}

	async action(message)
	{
		this._respond(message, `Current version is: **${this.bot.version}**`)
			.then(response => response.delete(5 * 1000));
	}
}
