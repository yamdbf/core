'use babel';
'use strict';

import { Command } from 'yamdbf';

export default class Ping extends Command
{
	constructor(bot)
	{
		super(bot, {
			name: 'ping',
			aliases: ['p'],
			description: 'Pong!',
			usage: '<prefix>ping',
			extraHelp: 'A basic ping/pong command example.',
			group: 'example',
			guildOnly: false,
			permissions: [],
			roles: [],
			ownerOnly: false
		});
	}

	async action(message, args, mentions, original) // eslint-disable-line no-unused-vars
	{
		message.reply('Pong!');
	}
}
