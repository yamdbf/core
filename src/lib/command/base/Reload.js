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
			aliases: ['r'],
			usage: '<prefix>reload [command]',
			extraHelp: `If a command name or alias is provided the specific command will be reloaded. Otherwise, all commands will be reloaded.`,
			group: 'base',
			permissions: ['ADMINISTRATOR']
		});
	}

	async action(message, args, mentions) // eslint-disable-line no-unused-vars
	{
		let start = now();
		if (args[0]) this.bot.commandLoader.reloadCommand(args[0]);
		else this.bot.commandLoader.loadCommands();
		let end = now();
		let name = args[0] ? this.bot.commands.findByNameOrAlias(args[0]).name : null;
		let text = name ? ` "${name}"` : 's';
		message.channel.sendMessage(`Command${text} reloaded. (${(end - start).toFixed(3)} ms)`)
			.then(response =>
			{
				response.delete(5 * 1000);
			});
	}
}
