import * as glob from 'glob';
import * as path from 'path';

import { CommandRegistry } from './CommandRegistry';
import { Bot } from '../bot/Bot';
import { Command } from './Command';

/**
 * Handles loading all commands from the given Bot's commandsDir
 * @private
 */
export class CommandLoader<T extends Bot>
{
	private _bot: T;
	public constructor(bot: T)
	{
		/** @type {Bot} */
		this._bot = bot;
	}

	/**
	 * Load or reload all commands from the base commands directory and the
	 * user-specified {@link Bot#commandsDir} directory and stores them in
	 * the Bot's {@link CommandRegistry} instance ({@link Bot#commands})
	 */
	public loadCommands(): void
	{
		if (this._bot.commands.size > 0) this._bot.commands = new CommandRegistry<T, string, Command<T>>();
		let commandFiles: string[] = [];
		commandFiles.push(...glob.sync(`${path.join(__dirname, './base')}/**/*.js`));
		commandFiles.push(...glob.sync(`${this._bot.commandsDir}/**/*.js`));
		let loadedCommands: number = 0;
		for (const fileName of commandFiles)
		{
			const commandLocation: string = fileName.replace('.js', '');
			delete require.cache[require.resolve(commandLocation)];

			let loadedCommandClass: any = this.getCommandClass(commandLocation);
			const _command: Command<T> = new loadedCommandClass(this._bot);

			if (this._bot.disableBase.includes(_command.name)) continue;
			_command._classloc = commandLocation;

			if (_command.overloads)
			{
				if (!this._bot.commands.has(_command.overloads))
					throw new Error(`Command "${_command.overloads}" does not exist to be overloaded.`);
				this._bot.commands.delete(_command.overloads);
				this._bot.commands.register(_command, _command.name);
				console.log(`Command '${_command.name}' loaded, overloading command '${_command.overloads}'.`);
			}
			else
			{
				this._bot.commands.register(_command, _command.name);
				loadedCommands++;
				console.log(`Command '${_command.name}' loaded.`);
			}
		}
		console.log(`Loaded ${loadedCommands} total commands in ${this._bot.commands.groups.length} groups.`);
	}

	/**
	 * Reload the given command in the Bot's {@link CommandRegistry} ({@link Bot#commands})
	 */
	public reloadCommand(nameOrAlias: string): boolean
	{
		const name: string = this._bot.commands.findByNameOrAlias(nameOrAlias).name;
		if (!name) return false;

		const commandLocation: string = this._bot.commands.get(name)._classloc;
		delete require.cache[require.resolve(commandLocation)];

		const loadedCommandClass: any = this.getCommandClass(commandLocation);
		const _command: Command<T> = new loadedCommandClass(this._bot);
		_command._classloc = commandLocation;
		this._bot.commands.register(_command, _command.name, true);
		console.log(`Command '${_command.name}' reloaded.`);
		return true;
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
