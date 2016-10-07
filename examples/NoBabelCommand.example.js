let Command = require('yamdbf').Command;

exports.default = class Ping extends Command
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

	action(message, args, mentions, original) // eslint-disable-line no-unused-vars
	{
		message.reply('Pong!');
	}
};
