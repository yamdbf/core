import * as glob from 'glob';
import * as path from 'path';
import { Client } from '../client/Client';
import { Command } from './Command';
import { BaseCommandName } from '../types/BaseCommandName';
import { Logger, logger } from '../util/logger/Logger';

/**
 * Handles loading all commands from the given Client's commandsDir
 * @private
 */
export class CommandLoader
{
	@logger private readonly logger: Logger;
	private readonly _client: Client;
	public constructor(client: Client)
	{
		this._client = client;
	}

	/**
	 * Load or reload all commands from the base commands directory and the
	 * user-specified {@link Client#commandsDir} directory and stores them in
	 * the Client's {@link CommandRegistry} instance ({@link Client#commands})
	 */
	public loadCommands(): void
	{
		if (this._client.commands.size > 0)
			for (const cmd of this._client.commands.filter(c => !c.external).values())
				this._client.commands.delete(cmd.name);

		let commandFiles: string[] = [];
		commandFiles.push(...glob.sync(`${path.join(__dirname, './base')}/**/*.js`));
		if (this._client.commandsDir)
			commandFiles.push(...glob.sync(`${this._client.commandsDir}/**/*.js`));

		let loadedCommands: number = 0;
		for (const fileName of commandFiles)
		{
			const commandLocation: string = fileName.replace('.js', '');
			delete require.cache[require.resolve(commandLocation)];

			const loadedCommandClass: typeof Command = this.getCommandClass(commandLocation);
			const command: Command = new loadedCommandClass();

			if (this._client.disableBase.includes(<BaseCommandName> command.name)) continue;
			command._classloc = commandLocation;

			if (this._client.commands.find(c => c.overloads === command.name))
			{
				this.logger.info('CommandLoader', `Skipping exterally overloaded command: '${command.name}'`);
				continue;
			}

			if (command.overloads)
			{
				if (!this._client.commands.has(command.overloads))
					throw new Error(`Command "${command.overloads}" does not exist to be overloaded.`);
				this._client.commands.delete(command.overloads);
				this._client.commands._registerInternal(command);
				this.logger.info('CommandLoader',
					`Command '${command.name}' loaded, overloading command '${command.overloads}'.`);
			}
			else
			{
				this._client.commands._registerInternal(command);
				loadedCommands++;
				this.logger.info('CommandLoader', `Command '${command.name}' loaded.`);
			}
		}
		this.logger.info('CommandLoader',
			`Loaded ${loadedCommands} total commands in ${this._client.commands.groups.length} groups.`);
	}

	/**
	 * Reload the given command in the Client's {@link CommandRegistry} ({@link Client#commands})
	 */
	public reloadCommand(nameOrAlias: string): void
	{
		const name: string = this._client.commands.findByNameOrAlias(nameOrAlias).name;
		if (!name) return;
		if (this._client.commands.get(name).external) return;

		const commandLocation: string = this._client.commands.get(name)._classloc;
		delete require.cache[require.resolve(commandLocation)];

		const loadedCommandClass: typeof Command = this.getCommandClass(commandLocation);
		const command: Command = new loadedCommandClass();
		command._classloc = commandLocation;
		this._client.commands._registerInternal(command, true);
		this.logger.info('CommandLoader', `Command '${command.name}' reloaded.`);
	}

	/**
	 * Get the Command class from an attempted Command class import
	 */
	private getCommandClass(loc: string): typeof Command
	{
		const importedObj: any = require(loc);
		let commandClass: typeof Command;
		if (importedObj && Object.getPrototypeOf(importedObj).name !== 'Command')
		{
			for (const key of Object.keys(importedObj))
				if (Object.getPrototypeOf(importedObj[key]).name === 'Command')
				{
					commandClass = importedObj[key];
					break;
				}
		}
		else commandClass = importedObj;
		if (!commandClass || Object.getPrototypeOf(commandClass).name !== 'Command')
			throw new Error(`Failed to find an exported Command class in file '${loc}'`);
		return commandClass;
	}
}
