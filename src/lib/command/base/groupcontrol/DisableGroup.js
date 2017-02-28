'use babel';
'use strict';

import Command from '../../Command';

export default class DisableGroup extends Command
{
	constructor(bot)
	{
		super(bot, {
			name: 'disablegroup',
			description: 'Disable a command group',
			aliases: ['disable', 'dg'],
			usage: '<prefix>disablegroup <group>',
			extraHelp: 'Disables a command group so that all of the commands in the group cannot be used on this server.',
			group: 'base',
			permissions: ['ADMINISTRATOR']
		});
	}

	async action(message, args)
	{
		let error = false;
		const err =	{
			NO_GROUP: 'You must provide a command group to disable.',
			NO_EXIST: `Command group ${args[0]} does not exist.`,
			DISABLED: `Command group ${args[0]} is already disabled or is not allowed to be disabled.`
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
		else if (args[0] === 'base' || this.bot.guildStorages.get(message.guild)
			.getSetting('disabledGroups').includes(args[0])) sendError(err.DISABLED);
		if (error) return;

		let disabledGroups = this.bot.guildStorages.get(message.guild).getSetting('disabledGroups');
		disabledGroups.push(args[0]);
		this.bot.guildStorages.get(message.guild).setSetting('disabledGroups', disabledGroups);

		this._respond(message, `**Disabled command group "${args[0]}"**`)
			.then(response => response.delete(5 * 1000));
	}
}
