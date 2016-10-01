'use babel';
'use strict';

import Command from '../../Command';

// Command class to extend to create commands users can execute
export default class Test extends Command
{
	constructor(bot)
	{
		super(bot, {
			name: 'test',
			description: 'a test command',
			usage: `<prefix>foo`,
			group: 'base',
			command: /foo/
		});
	}

	async action(message)
	{
		console.log(message.content); // eslint-disable-line no-console
	}
}
