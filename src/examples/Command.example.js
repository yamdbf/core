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
			usage: `<prefix>example`,
			group: 'example',
			guildOnly: true,
			command: /^example$/
		});
	}

	async action(message, args, mentions)
	{
		message.channel.sendMessage('Example command called');
	}
}
