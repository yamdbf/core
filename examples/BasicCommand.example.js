const { Command } = require('@yamdbf/core');

module.exports = class extends Command
{
	constructor()
	{
		super({
			name: 'ping',
			desc: 'Pong!',
			usage: '<prefix>ping',
			/* The remaining fields are optional 
			aliases: ['p'],
			info: 'A basic ping/pong command example.',
			group: 'example',
			clientPermissions: [],
			callerPermissions: [],
			roles: [],
			guildOnly: false,
			ownerOnly: false,
			hidden: false,
			argOpts: { separator: ',' },
			overloads: 'ping',
			ratelimit: '1/10s'
			*/
		});
	}

	action(message, args)
	{
		message.reply('Pong!');
	}
}
