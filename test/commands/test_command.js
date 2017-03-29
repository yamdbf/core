const { Command } = require('../../bin/');

exports.default = class extends Command
{
	constructor(client)
	{
		super(client, {
			name: 'test',
			description: 'test command',
			usage: '<prefix>test',
			group: 'test'
		});
	}

	action(message, args)
	{
		message.channel.send(args.join(' '));
	}
}
