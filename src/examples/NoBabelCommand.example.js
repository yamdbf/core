let Command = require('../lib/command/Command').default;

// Command class to extend to create commands users can execute
exports.default = class Example extends Command
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
			// guildOnly: true,
			permissions: ['ADMINISTRATOR']
		});
	}

	action(message)
	{
		console.log(message.content); // eslint-disable-line no-console
	}
};
