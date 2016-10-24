'use babel';
'use strict';

import Command from '../../Command';

export default class EnableGroup extends Command
{
	constructor(bot)
	{
		super(bot, {
			name: 'enablegroup',
			description: 'Enable a command group',
			aliases: ['enable', 'eg'],
			usage: '<prefix>enablegroup <group>',
			extraHelp: 'Enables a command group so that all of the commands in the group can be used on this server.',
			group: 'base',
			permissions: ['ADMINISTRATOR']
		});
	}

	async action(message, args, mentions) // eslint-disable-line no-unused-vars
	{
		let error = false;
		const err =	{
			NO_GROUP: 'You must provide a command group to enable.',
			NO_EXIST: `Command group ${args[0]} does not exist.`,
			ENABLED: `Command group ${args[0]} is already enabled.`
		};

		const self = this; // eslint-disable-line
		function sendError(text)
		{
			self.respond(message, `**${text}**`)
				.then(response => response.delete(5 * 1000));
			error = true;
		}

		if (!args[0]) sendError(err.NO_GROUP);
		else if (!this.bot.commands.groups.includes(args[0])) sendError(err.NO_EXIST);
		else if (args[0] === 'base' || !this.bot.guildStorages.get(message.guild)
			.getSetting('disabledGroups').includes(args[0])) sendError(err.ENABLED);
		if (error) return;

		let disabledGroups = this.bot.guildStorages.get(message.guild).getSetting('disabledGroups');
		disabledGroups.splice(disabledGroups.indexOf(args[0]), 1);
		this.bot.guildStorages.get(message.guild).setSetting('disabledGroups', disabledGroups);

		this._respond(message, `**Enabled command group "${args[0]}"**`)
			.then(response => response.delete(5 * 1000));
	}
}
