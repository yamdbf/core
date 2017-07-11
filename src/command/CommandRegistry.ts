import { Collection, TextChannel, PermissionResolvable } from 'discord.js';
import { Command } from '../command/Command';
import { Client } from '../client/Client';
import { Message } from '../types/Message';
import { Logger } from '../util/logger/Logger';
import { BaseCommandName } from '../types/BaseCommandName';

/**
 * @classdesc Stores loaded Commands in a Collection keyed by each Command's `name` property
 * @class CommandRegistry
 * @extends {external:Collection}
 */
export class CommandRegistry<T extends Client, K extends string, V extends Command<T>> extends Collection<K, V>
{
	public constructor() { super(); }

	/**
	 * Complete registration of a command and add to the parent
	 * collection, erroring on duplicate names and aliases.
	 * This is an internal method and should not be used. Use
	 * `registerExternal()` instead
	 * @private
	 */
	public _registerInternal(client: T, command: V, reload: boolean = false, external: boolean = false): void
	{
		if (reload && external) return;
		if (super.has(<K> command.name) && !reload
			&& !(command.overloads && command.overloads !== super.get(<K> command.overloads).name))
				if (!external) throw new Error(`A command with the name "${command.name}" already exists`);
				else throw new Error(`External command is conflicting with command "${command.name}"`);

		command._register(client);
		super.set(<K> command.name, command);

		for (const cmd of this.values())
		{
			for (const alias of cmd.aliases)
			{
				let duplicates: Collection<K, V> = this.filter(c => c.aliases.includes(alias) && c !== cmd);
				if (duplicates.size > 0)
				{
					const duplicate: string = duplicates.first().name;
					const name: string = cmd.name;
					if (!external) throw new Error(
						`Commands may not share aliases: ${name}, ${duplicate} (shared alias: "${alias}")`);
					else throw new Error(
						`External command has conflicting alias with "${name}" (shared alias: "${alias}")`);
				}
			}
		}
	}

	/**
	 * Register an external command add add it to the `<Client>.commands`
	 * [collection]{@link external:Collection}, erroring on duplicate
	 * names and aliases. External commands will be preserved when the
	 * `reload` command is called.
	 *
	 * >**Note:** This is intended for Plugins to use to register external
	 * commands with the Client instance. Under normal circumstances
	 * commands should be added by placing them in the directory passed
	 * to the `commandsDir` YAMDBF Client option
	 * @param {Client} client YAMDBF Client instance
	 * @param {Command} command The Command instance to be registered
	 * @returns {void}
	 */
	public registerExternal(client: T, command: Command<any>): void
	{
		if (command.overloads)
		{
			if (client.disableBase.includes(<BaseCommandName> command.overloads)) return;
			this.delete(<K> command.overloads);
			Logger.instance().info('CommandRegistry',
				`External command '${command.name}' registered, overloading base command '${command.overloads}'.`);
		}
		else Logger.instance().info('CommandRegistry', `External command '${command.name}' registered.`);
		this._registerInternal(client, <V> command, false, true);
		command.external = true;
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
	 * by the caller in the guild text channel the provided message is in.
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
			(<TextChannel> message.channel).permissionsFor(message.author).has(a);

		const byPermissions: (c: V) => boolean = c =>
			c.callerPermissions.length > 0 ? c.callerPermissions.filter(currentPermissions).length > 0 : true;

		const byRoles: (c: V) => boolean = c =>
			!(c.roles.length > 0 && message.member.roles.filter(role => c.roles.includes(role.name)).size === 0);

		const byOwnerOnly: (c: V) => boolean = c =>
			(client.isOwner(message.author) && c.ownerOnly) || !c.ownerOnly;

		const disabledGroups: string[] = await message.guild.storage.settings.get('disabledGroups') || [];
		for (const [name, command] of this.filter(byPermissions).filter(byRoles).filter(byOwnerOnly).entries())
			if (!disabledGroups.includes(command.group)) filtered.set(name, command);

		return filtered;
	}

	/**
	 * Returns all commands usable by the caller within the DM channel the provided
	 * message is in
	 * @param {Client} client YAMDBF Client instance
	 * @param {external:Message} message - Discord.js Message object
	 * @returns {external:Collection<string, Command>}
	 */
	public filterDMUsable(client: T, message: Message): Collection<K, V>
	{
		return this.filter(c => !c.guildOnly &&
			((client.isOwner(message.author) && c.ownerOnly) || !c.ownerOnly));
	}

	/**
	 * Returns all commands that can have their help looked up by the caller
	 * in the DM channel the message is in
	 * @param {Client} client YAMDBF Client instance
	 * @param {external:Message} message Discord.js Message object
	 * @returns {external:Collection<string, Command>}
	 */
	public filterDMHelp(client: T, message: Message): Collection<K, V>
	{
		return this.filter(c => (client.isOwner(message.author) && c.ownerOnly) || !c.ownerOnly);
	}
}
