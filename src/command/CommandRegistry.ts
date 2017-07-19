import { Collection } from 'discord.js';
import { Command } from '../command/Command';
import { Client } from '../client/Client';
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
			&& !(command.overloads && super.has(<K> command.overloads)
				&& command.overloads !== super.get(<K> command.overloads).name))
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
	 * Register an external command and add it to the `<Client>.commands`
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
			let overload: boolean = this.has(<K> command.overloads);
			this.delete(<K> command.overloads);
			this._registerInternal(client, <V> command, false, true);
			Logger.instance().info('CommandRegistry',
				`External command '${command.name}' registered${
					overload ? `, overloading base command '${command.overloads}'.` : '.'}`);
		}
		else
		{
			this._registerInternal(client, <V> command, false, true);
			Logger.instance().info('CommandRegistry', `External command '${command.name}' registered.`);
		}
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
		text = text ? text.toLowerCase() : text;
		return this.find(c => c.name.toLowerCase() === text
			|| !!c.aliases.find(a => a.toLowerCase() === text));
	}
}
