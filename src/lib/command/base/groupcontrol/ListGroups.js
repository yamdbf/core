'use babel';
'use strict';

import Command from '../../Command';

export default class ListGroups extends Command
{
	constructor(bot)
	{
		super(bot, {
			name: 'listgroups',
			description: 'List all command groups and their status',
			aliases: ['lg'],
			usage: '<prefix>listgroups',
			extraHelp: `A '*' denotes a disabled group when listing all command groups.`,
			group: 'base',
			permissions: ['ADMINISTRATOR']
		});
	}

	async action(message, args, mentions) // eslint-disable-line no-unused-vars
	{
		let groups = this.bot.commands.groups;
		let disabledGroups = this.bot.guildStorages.get(message.guild).getSetting('disabledGroups');

		let output = '```ldif\nCommand groups:\n';
		groups.forEach(a =>
		{
			output += `${disabledGroups.includes(a) ? '' : ' '}${disabledGroups.includes(a) ? '*' : ''}${a}\n`;
		});
		output += '```';

		message.channel.sendMessage(output)
			.then(response =>
			{
				response.delete(10 * 1000);
			});
	}
}
