import * as glob from 'glob';
import * as path from 'path';
import { Client } from '../client/Client';
import { Logger, logger } from '../util/logger/Logger';
import { CommandRegistry } from './CommandRegistry';
import { Command } from './Command';
import { BaseCommandName } from '../types/BaseCommandName';
import { Util } from '../util/Util';

/**
 * Handles loading all commands from the given Client's commandsDir
 * @private
 */
export class CommandLoader
{
	@logger('CommandLoader')
	private readonly _logger!: Logger;
	private readonly _client: Client;
	private readonly _commands: CommandRegistry<any>;

	public constructor(client: Client)
	{
		this._client = client;
		this._commands = client.commands;
	}

	/**
	 * Load commands from the given directory
	 * @param {string} dir Directory to load from
	 * @param {boolean} [base=false] Whether or not the commands being loaded are base commands
	 * @returns {number} The number of Commands loaded from the directory
	 */
	public loadCommandsFrom(dir: string, base: boolean = false): number
	{
		dir = path.resolve(dir);

		// Glob all the javascript files in the directory
		let commandFiles: string[] = glob.sync(`${dir}/**/*.js`);

		// Glob typescript files if `tsNode` is enabled
		if (this._client.tsNode)
		{
			commandFiles.push(...glob.sync(`${dir}/**/!(*.d).ts`));
			const filteredCommandFiles = commandFiles.filter(f => {
				const file: string = f.match('/([^\/]+?)\.[j|t]s$')![1];
				if (f.endsWith('.ts')) return true;
				if (f.endsWith('.js'))
					return !commandFiles.find(cf => cf.endsWith(`${file}.ts`));
			});
			commandFiles = filteredCommandFiles;
		}

		const loadedCommands: Command[] = [];
		this._logger.debug(`Loading commands in: ${dir}`);

		// Load and instantiate every command from the globbed files
		for (const file of commandFiles)
		{
			// Delete the cached command file for hot-reloading
			delete require.cache[require.resolve(file)];

			const loadedFile: any = require(file);
			const commandClasses: (new () => Command)[] = this._findCommandClasses(loadedFile);

			if (commandClasses.length === 0)
			{
				this._logger.warn(`Failed to find Command class in file: ${file}`);
				continue;
			}

			for (const commandClass of commandClasses)
			{
				const commandInstance: Command = new commandClass();

				// Don't load disabled base commands
				if (base && this._client.disableBase
					.includes(commandInstance.name as BaseCommandName))
					continue;

				this._logger.info(`Loaded command: ${commandInstance.name}`);
				commandInstance._classloc = file;
				loadedCommands.push(commandInstance);
			}
		}

		// Register all of the loaded commands
		for (const command of loadedCommands)
			this._commands._registerInternal(command);

		return loadedCommands.length;
	}

	/**
	 * Recursively search for Command classes within the given object
	 * @private
	 */
	private _findCommandClasses(obj: any): (new () => Command)[]
	{
		const foundClasses: ((new () => Command) | (new () => Command)[])[] = [];
		const keys: string[] = Object.keys(obj);
		if (Command.prototype.isPrototypeOf(obj.prototype))
			foundClasses.push(obj);

		else if (keys.length > 0)
			for (const key of keys)
				if (Command.prototype.isPrototypeOf(obj[key].prototype))
					foundClasses.push(this._findCommandClasses(obj[key]));

		return Util.flattenArray(foundClasses);
	}
}
