'use babel';
'use strict';
import { normalize } from '../../../Util';

import Command from '../../Command';

export default class Limit extends Command
{
	constructor(bot)
	{
		super(bot, {
			name: 'limit',
			description: 'Limit a command to the provided roles',
			usage: '<prefix>limit <command>, <role names, ...>',
			extraHelp: 'The comma after the command name -- before the role names list -- is necessary.',
			group: 'base',
			argOpts: { separator: ',' },
			permissions: ['ADMINISTRATOR']
		});
	}

	async action(message, args)
	{
		let commandName = args.shift();
		if (!commandName) return this._respond(message, `You must provide a command to limit.`);
		const command = this.bot.commands.find(c => normalize(commandName) === normalize(c.name));
		if (!command) return this._respond(message, `Failed to find a command with the name \`${commandName}\``);
		if (command.group === 'base') this._respond(message, `Cannot limit base commands.`);

		const storage = message.guild.storage;
		let limitedCommands = storage.getSetting('limitedCommands') || {};
		let newLimit = limitedCommands[command.name] || [];

		let roles = [];
		let invalidRoles = [];
		for (const name of args)
		{
			let foundRole = message.guild.roles.find(role => normalize(role.name) === normalize(name));
			if (!foundRole) invalidRoles.push(name);
			else if (foundRole && newLimit.includes(foundRole.id)) message.channel.send(
				`Role \`${foundRole.name}\` is already a limiter for command: \`${command.name}\``);
			else roles.push(foundRole);
		}

		if (invalidRoles.length > 0) message.channel.send(`Couldn't find role${
			invalidRoles.length > 1 ? 's' : ''}: \`${invalidRoles.join('`, `')}\``);
		if (roles.length === 0) return this._respond(message, `Failed to add any roles to the command.`);

		newLimit = newLimit.concat(roles.map(role => role.id));
		limitedCommands[command.name] = newLimit;
		storage.setSetting('limitedCommands', limitedCommands);

		return this._respond(message, `Successfully added role${roles.length > 1 ? 's' : ''}: \`${
			roles.map(role => role.name).join('`, `')}\` to the limiter for command: \`${command.name}\``);
	}
}
