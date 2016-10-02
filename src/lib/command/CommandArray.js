'use babel';
'use strict';

import Command from './Command';
import CommandRegistry from './CommandRegistry';

export default class CommandArray extends Array
{
	constructor(args)
	{
		super();

		if (Array.isArray(args) && args.length > 1)
		{
			args.forEach(a =>
			{
				if (a instanceof Command) this.push(a);
				else throw new Error('CommandArray may only contain Command types');
			});
		}
		else if (args instanceof Command)
		{
			this.push(args);
		}
	}

	static from(source)
	{
		if (source instanceof CommandRegistry)
		{
			return new CommandArray(Array.from(source).map(a => a[1]));
		}
		else
		{
			return new CommandArray(source);
		}
	}

	push(item)
	{
		if (item instanceof Command) super.push(item);
		else throw new Error('CommandArray may only contain Command types');
	}

	filterByUsability(bot, message)
	{
		return this.filter(c => c.permissions.length > 0 ? c.permissions
			.filter(a => message.channel.permissionsFor(message.author)
				.hasPermission(a)).length > 0 : true)
			.filter(c => !(c.roles.length > 0 && !message.member.roles.filter(role =>
				c.roles.includes(role.name)).size > 0))
			.filter(c => !bot.guildStorages.get(message.guild)
				.getSetting('disabledGroups').includes(c.group));
	}
}
