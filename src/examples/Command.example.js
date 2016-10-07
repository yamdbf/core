'use babel';
'use strict';

import { Command } from 'yamdbf';

export default class Example extends Command
{
	constructor(bot)
	{
		super(bot, {
			name: 'example',
			aliases: ['ex, e'],
			description: 'An example command',
			usage: '<prefix>example',
			extraHelp: 'An example command to show the basic boilerplate for writing a command.',
			group: 'example',
			guildOnly: false,
			permissions: [],
			roles: [],
			ownerOnly: false
		});
	}

	async action(message, args, mentions, original) // eslint-disable-line no-unused-vars
	{
		message.channel.sendMessage(message.content);
		console.log(this.bot.version); // eslint-disable-line no-console
	}
}
