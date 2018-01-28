import { Client } from '../client/Client';
import { Command } from './Command';
import { Collection } from 'discord.js';
import { Logger, logger } from '../util/logger/Logger';

/**
 * @classdesc Stores loaded Commands in a Collection keyed by each Command's `name` property
 * @class CommandRegistry
 * @extends {external:Collection}
 */
export class CommandRegistry<
	T extends Client,
	K extends string = string,
	V extends Command<T> = Command<T>>
	extends Collection<K, V>
{
	@logger('CommandRegistry')
	private readonly _logger: Logger;
	private readonly _client: T;

	public constructor(client: T)
	{
		super();
		Object.defineProperty(this, '_client', { value: client });
	}

	/**
	 * Contains all [Command groups]{@link Command#group}
	 * @readonly
	 * @type {string[]}
	 */
	public get groups(): string[]
	{
		return Array.from(new Set(this.map(c => c.group)));
	}

	/**
	 * Register an external command and add it to the `<Client>.commands`
	 * [collection]{@link external:Collection}, erroring on duplicate
	 * aliases
	 *
	 * >**Note:** This is intended for Plugins to use to register external
	 * commands with the Client instance. Under normal circumstances
	 * commands should be added by placing them in the directory passed
	 * to the `commandsDir` YAMDBF Client option
	 * @param {Command} command The Command instance to be registered
	 * @returns {void}
	 */
	public registerExternal(command: Command<any>): void
	{
		this._logger.info(`External command loaded: ${command.name}`);
		this._registerInternal(<V> command, true);
	}

	/**
	 * Resolve the given Command name or alias to a registered Command
	 * @param {string} input Command name or alias
	 * @returns Command
	 */
	public resolve(input: string): V
	{
		input = input ? input.toLowerCase() : input;
		return this.find(c => c.name.toLowerCase() === input
			|| !!c.aliases.find(a => a.toLowerCase() === input));
	}

	/**
	 * Complete registration of a command and add to the parent
	 * collection, erroring on duplicate names and aliases.
	 * This is an internal method and should not be used. Use
	 * `registerExternal()` instead
	 * @private
	 */
	public _registerInternal(command: V, external: boolean = false): void
	{
		if (this.has(<K> command.name))
		{
			if (!this.get(<K> command.name).external)
				this._logger.info(`Replacing previously loaded command: ${command.name}`);
			else
				this._logger.info(`Replacing externally loaded command: ${command.name}`);

			this.delete(<K> command.name);
		}
		this.set(<K> command.name, command);
		command._register(this._client);
		if (external) command.external = true;
	}

	/**
	 * Check for duplicate aliases. Used internally
	 * @private
	 */
	public _checkDuplicateAliases(): void
	{
		for (const command of this.values())
			for (const alias of command.aliases)
			{
				const duplicate: V = this.filter(c => c !== command).find(c => c.aliases.includes(alias));
				const name: string = command.name;

				if (!duplicate) continue;
				if (!command.external) throw new Error(
					`Commands may not share aliases: ${name}, ${duplicate.name} (shared alias: "${alias}")`);

				else throw new Error(
					`External command "${
						duplicate.name}" has conflicting alias with "${name}" (shared alias: "${alias}")`);
			}
	}

	/**
	 * Run the `init()` method of all loaded commands.
	 * This is an internal method and should not be used
	 * @private
	 */
	public async _initCommands(): Promise<boolean>
	{
		let success: boolean = true;
		for (const command of this.values())
		{
			if (command._initialized) continue;
			try
			{
				await command.init();
				command._initialized = true;
			}
			catch (err)
			{
				success = false;
				this._logger.error(
					`Command "${command.name}" errored during initialization: \n\n${err.stack}`,
					command.external ? '\n\nPlease report this error to the command author.\n' : '\n');
			}
		}
		return success;
	}
}
