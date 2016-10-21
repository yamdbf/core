'use babel';
'use strict';

import Command from '../Command';

export default class Ping extends Command
{
	constructor(bot)
	{
		super(bot, {
			name: 'ping',
			aliases: [],
			description: 'Pong!',
			usage: '<prefix>ping',
			extraHelp: '',
			group: 'base'
		});
	}

	async action(message)
	{
		message.channel.sendMessage(`Pong!`).then(msg =>
            msg.edit(`Pong! (${msg.timestamp - message.timestamp}ms)`));
	}
}
