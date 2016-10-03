'use babel';
'use strict';

import CommandArray from './CommandArray';

export default class CommandRegistry extends Map
{
	constructor()
	{
		super();
	}

	// Complete registration of command and add to CommandRegistry storage
	register(command, key)
	{
		if (super.has(command.name)) throw new Error(`A command with the name "${command.name}" already exists.`);
		command.register();
		super.set(key, command);
		this.forEach(a =>
		{
			a.aliases.forEach(b =>
			{
				let duplicates = this.commandArray().filter(c => c.aliases.includes(b) && c !== a);
				if (duplicates.length > 0)
				{
					throw new Error(`Commands may not share aliases: ${duplicates[0].name}, ${a.name} (shared alias: ${b})`);
				}
			});
		});
	}

	get groups()
	{
		let groups = [];
		this.forEach(c =>
		{
			if (!groups.includes(c.group)) groups.push(c.group);
		});
		return groups;
	}

	commandArray()
	{
		return CommandArray.from(this);
	}
}
