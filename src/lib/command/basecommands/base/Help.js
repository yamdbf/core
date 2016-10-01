'use babel';
'use strict';

import Command from '../../Command';

// Command class to extend to create commands users can execute
export default class Help extends Command
{
	constructor(bot)
	{
		super(bot, {
			name: 'help',
			description: 'Provides information on bot commands',
			usage: `<prefix>help`,
			group: 'base',
			command: /^help(?: (.+))?$/
		});
	}

	async action(message, args, mentions)
	{
		console.log(args[0]); // eslint-disable-line no-console
		console.log(mentions);
	}
}
