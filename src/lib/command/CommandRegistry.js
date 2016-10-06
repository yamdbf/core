'use babel';
'use strict';

import { Collection } from 'discord.js';

export default class CommandRegistry extends Collection
{
	constructor()
	{
		super();
	}

	// Complete registration of command and add to CommandRegistry storage,
	// prevent duplicate names and aliases between commands
	register(command, key, reload)
	{
		if (super.has(command.name) && !reload) throw new Error(`A command with the name "${command.name}" already exists.`);
		command.register();
		super.set(key, command);
		this.forEach(a =>
		{
			a.aliases.forEach(b =>
			{
				let duplicates = this.filter(c => c.aliases.includes(b) && c !== a);
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

	findByNameOrAlias(text)
	{
		return this.filter(c => c.name === text || c.aliases.includes(text)).first();
	}

	// Return all commands usable by the user in the guild channel the
	// help command was called in
	filterGuildUsable(bot, message)
	{
		return this.filter(c => c.permissions.length > 0 ? c.permissions
			.filter(a => message.channel.permissionsFor(message.author)
				.hasPermission(a)).length > 0 : true)
			.filter(c => !(c.roles.length > 0 && !message.member.roles.filter(role =>
				c.roles.includes(role.name)).size > 0))
			.filter(c => !bot.guildStorages.get(message.guild)
				.getSetting('disabledGroups').includes(c.group))
			.filter(c => (bot.config.owner
				.includes(message.author.id) && c.ownerOnly) || !c.ownerOnly);
	}

	// Returns all commands that are usable within a DM by the user
	filterDMUsable(bot, message)
	{
		return this.filter(c => !c.guildOnly && ((bot.config.owner
			.includes(message.author.id) && c.ownerOnly) || !c.ownerOnly));
	}

	// Returns all commands that can have their help looked up in
	// a DM by the user
	filterDMHelp(bot, message)
	{
		return this.filter(c => (bot.config.owner
			.includes(message.author.id) && c.ownerOnly) || !c.ownerOnly);
	}
}
