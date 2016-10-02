'use babel';
'use strict';

import Command from '../lib/command/Command';

// Command class to extend to create commands users can execute
export default class TestCommand extends Command
{
	constructor(bot)
	{
		super(bot, {
			name: 'testcommand',
			description: 'a test command',
			usage: `<prefix>testcommand`,
			group: 'foo',
			// guildOnly: true,
			permissions: ['ADMINISTRATOR'],
			command: /^testcommand$/
		});
	}

	async action(message)
	{
		console.log(message.content); // eslint-disable-line no-console
	}
}
