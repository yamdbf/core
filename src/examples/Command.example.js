'use babel';
'use strict';

import Command from '../lib/command/Command';

// Command class to extend to create commands users can execute
export default class Example extends Command
{
	constructor(bot)
	{
		super(bot, {
			name: 'example',
			description: 'an example command',
			aliases: [],
			usage: '<prefix>example',
			extraHelp: 'this command is an example command, it just tells you the command has been called',
			group: 'example',
			guildOnly: true,
			roles: [],
			permissions: [],
			command: /^example$/
		});
	}

	async action(message, args, mentions) // eslint-disable-line no-unused-vars
	{
		message.channel.sendMessage('Example command called');
	}
}
