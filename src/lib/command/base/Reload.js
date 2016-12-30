'use babel';
'use strict';

import Command from '../Command';
import now from 'performance-now';

export default class Reload extends Command
{
	constructor(bot)
	{
		super(bot, {
			name: 'reload',
			description: 'Reload a command or all commands',
			aliases: [],
			usage: '<prefix>reload [command]',
			extraHelp: `If a command name or alias is provided the specific command will be reloaded. Otherwise, all commands will be reloaded.`,
			group: 'base',
			ownerOnly: true
		});
	}

	async action(message, args, mentions) // eslint-disable-line no-unused-vars
	{
		const start = now();
		const command = this.bot.commands.findByNameOrAlias(args[0]);

		if (args[0] && !command)
			return this._respond(message, `Command "${args[0]}" could not be found.`)
				.then(response => response.delete(5 * 1000));

		if (command) this.bot.loadCommand(command.name);
		else this.bot.loadCommand('all');

		const end = now();
		const name = command ? command.name : null;
		const text = name ? ` "${name}"` : 's';
		return this._respond(message, `Command${text} reloaded. (${(end - start).toFixed(3)} ms)`)
			.then(response => response.delete(5 * 1000));
	}
}
