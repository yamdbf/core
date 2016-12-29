'use babel';
'use strict';

import Command from '../Command';

export default class SetPrefix extends Command
{
	constructor(bot)
	{
		super(bot, {
			name: 'setprefix',
			description: 'Set or check the bot command prefix for this guild',
			aliases: ['prefix'],
			usage: '<prefix>setprefix [text]',
			extraHelp: 'Prefixes may be 1-10 characters in length and may not include backslashes or backticks. Set the prefix to "noprefix" to allow commands to be called without a prefix.',
			group: 'base',
			permissions: ['ADMINISTRATOR']
		});
	}

	async action(message, args, mentions) // eslint-disable-line no-unused-vars
	{
		if (!args[0])
		{
			this._respond(message, `${this.bot.getPrefix(message.guild)
				? `Current prefix is \`${this.bot.getPrefix(message.guild)}\``
				: 'There is currently no prefix.'}`)
				.then(res => res.delete(5e3));
			return;
		}
		if (args[0].length > 10)
		{
			this._respond(message, `Prefixes may only be up to 10 chars in length.`)
				.then(res => res.delete(5e3));
			return;
		}
		if (/[\\`]/.test(args[0]))
		{
			this._respond(message, `Prefixes may not contain backticks or backslashes.`)
				.then(res => res.delete(5e3));
			return;
		}
		if (args[0] === 'noprefix') args[0] = '';

		if (this.bot.selfbot) this.bot.guildStorages.forEach(guild => guild.setSetting('prefix', args[0]));
		else this.bot.guildStorages.get(message.guild).setSetting('prefix', args[0]);
		this._respond(message, args[0] === '' ? 'Command prefix removed.'
			: `Command prefix set to \`${args[0]}\``)
			.then(res => res.delete(5e3));
	}
}
