'use babel';
'use strict';

import { Collection } from 'discord.js';

/**
 * Stores loaded Commands as &lt;[name]{@link Command#name}, [Command]{@link Command}&gt; pairs
 * @class CommandRegistry
 * @extends {external:Collection}
 */
export default class CommandRegistry extends Collection
{
	constructor()
	{
		super();
	}

	/**
	 * Complete registration of a command and add to the parent [Collection]{@link external:Collection},
	 * erroring on duplicate names and aliases
	 * @memberof CommandRegistry
	 * @instance
	 * @param {Command} command - The Command to be registered
	 * @param {string} key - The key to store the Command at. Will be {@link Command#name}
	 * @param {boolean} reload - Whether or not the command is being reloaded and
	 * replaced in the collection
	 */
	register(command, key, reload)
	{
		if (super.has(command.name) && !reload && (command.overload && command.overload !== super.get(command.overload).name))
		{
			throw new Error(`A command with the name "${command.name}" already exists.`);
		}
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

	/**
	 * Contains all [Command groups]{@link Command#group}
	 * @memberof CommandRegistry
	 * @instance
	 * @type {string[]}
	 */
	get groups()
	{
		let groups = [];
		this.forEach(c =>
		{
			if (!groups.includes(c.group)) groups.push(c.group);
		});
		return groups;
	}

	/**
	 * Finds a command by [name]{@link Command#name} or [alias]{@link Command#aliases}
	 * @memberof CommandRegistry
	 * @instance
	 * @param {string} text - The name or alias of the Command
	 * @returns {Command}
	 */
	findByNameOrAlias(text)
	{
		return this.filter(c => c.name === text || c.aliases.includes(text)).first();
	}

	/**
	 * Returns all commands usable by the user in the guild text channel
	 * the provided message is in
	 * @memberof CommandRegistry
	 * @instance
	 * @param {Bot} bot - Bot instance
	 * @param {external:Message} message - Discord.js Message object
	 * @returns {external:Collection<string, Command>}
	 */
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

	/**
	 * Returns all commands usable by the user within the DM channel the provided
	 * message is in
	 * @memberof CommandRegistry
	 * @instance
	 * @param {Bot} bot - Bot instance
	 * @param {external:Message} message - Discord.js Message object
	 * @returns {external:Collection<string, Command>}
	 */
	filterDMUsable(bot, message)
	{
		return this.filter(c => !c.guildOnly && ((bot.config.owner
			.includes(message.author.id) && c.ownerOnly) || !c.ownerOnly));
	}

	// Returns all commands that can have their help looked up in
	// a DM by the user
	/**
	 * Returns all commands that can have their help looked up by the user
	 * in the DM channel the message is in
	 * @memberof CommandRegistry
	 * @instance
	 * @param {Bot} bot - Bot instance
	 * @param {external:Message} message - Discord.js Message object
	 * @returns {external:Collection<string, Command>}
	 */
	filterDMHelp(bot, message)
	{
		return this.filter(c => (bot.config.owner
			.includes(message.author.id) && c.ownerOnly) || !c.ownerOnly);
	}
}
