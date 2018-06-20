import * as glob from 'glob';
import * as path from 'path';
import { Client } from '../client/Client';
import { Logger, logger } from '../util/logger/Logger';
import { CommandRegistry } from './CommandRegistry';
import { Command } from './Command';
import { BaseCommandName } from '../types/BaseCommandName';

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
		let commandFiles: string[] = glob.sync(`${dir}/**/*.js`);

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

		for (const file of commandFiles)
		{
			delete require.cache[require.resolve(file)];
			const loadedFile: any = require(file);
			const commandClass: new () => Command = this._findCommandClass(loadedFile)!;
			if (!commandClass)
			{
				this._logger.debug(`Failed to find Command class in file: ${file}`);
				continue;
			}

			const commandInstance: Command = new commandClass();

			if (base && this._client.disableBase
				.includes(commandInstance.name as BaseCommandName))
				continue;

			this._logger.info(`Loaded command: ${commandInstance.name}`);
			commandInstance._classloc = file;
			loadedCommands.push(commandInstance);
		}

		for (const command of loadedCommands)
			this._commands._registerInternal(command);

		return loadedCommands.length;
	}

	/**
	 * Recursively search for a Command class within the given object
	 * @private
	 */
	private _findCommandClass(obj: any): (new () => Command) | undefined
	{
		let foundClass!: new () => Command;
		const keys: string[] = Object.keys(obj);
		if (Object.getPrototypeOf(obj).name === 'Command')
			foundClass = obj;

		else if (keys.length > 0)
			for (const key of keys)
			{
				foundClass = this._findCommandClass(obj[key])!;
				if (!foundClass) continue;
				if (Object.getPrototypeOf(foundClass).name === 'Command') break;
			}

		return foundClass;
	}
}
