import { Collection, TextChannel, PermissionResolvable } from 'discord.js';
import { Command } from '../command/Command';
import { Client } from '../client/Client';
import { Message } from '../types/Message';

/**
 * @classdesc Stores loaded Commands in a Collection keyed by each Command's `name` property
 * @class CommandRegistry
 * @extends {external:Collection}
 */
export class CommandRegistry<T extends Client, K extends string, V extends Command<T>> extends Collection<K, V>
{
	public constructor() { super(); }

	/**
	 * Complete registration of a command and add to the parent [Collection]{@link external:Collection},
	 * erroring on duplicate names and aliases
	 * @param {Command} command The Command to be registered
	 * @param {string} key The key to store the Command at. Will be {@link Command#name}
	 * @param {boolean} reload Whether or not the command is being reloaded and
	 * replaced in the collection
	 * @returns {void}
	 */
	public register(command: V, key: K, reload?: boolean): void
	{
		if (super.has(<K> command.name) && !reload && !(command.overloads && command.overloads !== super.get(<K> command.overloads).name))
			throw new Error(`A command with the name "${command.name}" already exists.`);

		for (const cmd of this.values())
		{
			for (const alias of cmd.aliases)
			{
				let duplicates: Collection<K, V> = this.filter(c => c.aliases.includes(alias) && c !== cmd);
				if (duplicates.size > 0)
					throw new Error(`Commands may not share aliases: ${duplicates.first().name}, ${cmd.name} (shared alias: ${alias})`);
			}
		}

		command.register();
		super.set(key, <V> command);
	}

	/**
	 * Contains all [Command groups]{@link Command#group}
	 * @type {string[]}
	 */
	public get groups(): string[]
	{
		return this.map(a => a.group).filter((a, i, self) => self.indexOf(a) === i);
	}

	/**
	 * Finds a command by [name]{@link Command#name} or [alias]{@link Command#aliases}
	 * @param {string} text The name or alias of the Command
	 * @returns {Command}
	 */
	public findByNameOrAlias(text: string): V
	{
		return this.filter(c => c.name === text || c.aliases.includes(text)).first();
	}

	/**
	 * Returns a Promise resolving with a collection of all commands usable
	 * by the user in the guild text channel the provided message is in.
	 * Needs to be async due to having to access guild settings to check
	 * for disabled groups
	 * @param {Client} client YAMDBF Client instance
	 * @param {external:Message} message Discord.js Message object
	 * @returns {Promise<external:Collection<string, Command>>}
	 */
	public async filterGuildUsable(client: T, message: Message): Promise<Collection<K, V>>
	{
		let filtered: Collection<K, V> = new Collection<K, V>();
		const currentPermissions: (a: PermissionResolvable) => boolean = a =>
			(<TextChannel> message.channel).permissionsFor(message.author).hasPermission(a);

		const byPermissions: (c: V) => boolean = c =>
			c.permissions.length > 0 ? c.permissions.filter(currentPermissions).length > 0 : true;

		const byRoles: (c: V) => boolean = c =>
			!(c.roles.length > 0 && message.member.roles.filter(role => c.roles.includes(role.name)).size === 0);

		const byOwnerOnly: (c: V) => boolean = c =>
			((<any> client.config).owner.includes(message.author.id) && c.ownerOnly) || !c.ownerOnly;

		const disabledGroups: string[] = await message.guild.storage.settings.get('disabledGroups') || [];
		for (const [name, command] of this.filter(byPermissions).filter(byRoles).filter(byOwnerOnly).entries())
			if (!disabledGroups.includes(command.group)) filtered.set(name, command);

		return filtered;
	}

	/**
	 * Returns all commands usable by the user within the DM channel the provided
	 * message is in
	 * @param {Client} client YAMDBF Client instance
	 * @param {external:Message} message - Discord.js Message object
	 * @returns {external:Collection<string, Command>}
	 */
	public filterDMUsable(client: T, message: Message): Collection<K, V>
	{
		return this.filter(c => !c.guildOnly && (((<any> client.config).owner
			.includes(message.author.id) && c.ownerOnly) || !c.ownerOnly));
	}

	/**
	 * Returns all commands that can have their help looked up by the user
	 * in the DM channel the message is in
	 * @param {Client} client YAMDBF Client instance
	 * @param {external:Message} message Discord.js Message object
	 * @returns {external:Collection<string, Command>}
	 */
	public filterDMHelp(client: T, message: Message): Collection<K, V>
	{
		return this.filter(c => ((<any> client.config).owner
			.includes(message.author.id) && c.ownerOnly) || !c.ownerOnly);
	}
}
