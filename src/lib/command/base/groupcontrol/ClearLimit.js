'use babel';
'use strict';
import { normalize } from '../../../Util';

import Command from '../../Command';

export default class ClearLimit extends Command
{
	constructor(bot)
	{
		super(bot, {
			name: 'clearlimit',
			description: 'Clear role restrictions from a command',
			usage: '<prefix>clearlimit <command>',
			group: 'base',
			permissions: ['ADMINISTRATOR']
		});
	}

	async action(message, args)
	{
		let commandName = args[0];
		if (!commandName) return this._respond(message, `You must provide a command to clear limits for.`);
		let command = this.bot.commands.find(c => normalize(c.name) === normalize(commandName));
		if (!command) return this._respond(message, `Failed to find a command with the name \`${commandName}\``);

		const storage = message.guild.storage;
		let limitedCommands = storage.getSetting('limitedCommands') || {};
		delete limitedCommands[command.name];
		storage.setSetting('limitedCommands', limitedCommands);

		return this._respond(message, `Successfully cleared role limits for command: \`${command.name}\``);
	}
}
