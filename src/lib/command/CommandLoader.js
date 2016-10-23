'use babel';
'use strict';

import glob from 'glob';
import path from 'path';

import CommandRegistry from './CommandRegistry';

/**
 * Handles loading all commands from the given Bot's commandsDir
 * @class CommandLoader
 * @param {Bot} bot - Bot instance
 */
export default class CommandLoader
{
	constructor(bot)
	{
		/** @type {Bot} */
		this._bot = bot;
	}

	/**
	 * Load or reload all commands from the base commands directory and the
	 * user-specified {@link Bot#commandsDir} directory and stores them in
	 * the Bot's {@link CommandRegistry} instance ({@link Bot#commands})
	 * @memberof CommandLoader
	 * @instance
	 */
	loadCommands()
	{
		if (this._bot.commands.size > 0) this._bot.commands = new CommandRegistry();
		let commandFiles = [];
		commandFiles.push(...glob.sync(`${path.join(__dirname, './base')}/**/*.js`));
		commandFiles.push(...glob.sync(`${this._bot.commandsDir}/**/*.js`));
		let loadedCommands = 0;
		commandFiles.forEach(fileName =>
		{
			let commandLocation = fileName.replace('.js', '');
			delete require.cache[require.resolve(commandLocation)];
			let Command = require(commandLocation).default;
			let command = new Command(this._bot);
			if (this._bot.disableBase.includes(command.name)) return;
			command.classloc = commandLocation;
			if (command.overloads)
			{
				if (!this._bot.commands.has(command.overloads)) // eslint-disable-line curly
					throw new Error(`Command "${command.overloads}" does not exist to be overloaded.`);
				this._bot.commands.delete(command.overloads);
				this._bot.commands.register(command, command.name);
			}
			else
			{
				this._bot.commands.register(command, command.name);
			}
			if (!command.overloads)
			{
				loadedCommands++;
				console.log(`Command '${command.name}' loaded.`); // eslint-disable-line no-console
			}
			else
			{
				console.log(`Command '${command.name}' loaded, overloading command '${command.overloads}'.`); // eslint-disable-line no-console
			}
		});
		console.log(`Loaded ${loadedCommands} total commands in ${this._bot.commands.groups.length} groups.`); // eslint-disable-line no-console
	}

	/**
	 * Reload the given command in the Bot's {@link CommandRegistry} ({@link Bot#commands})
	 * @memberof CommandLoader
	 * @instance
	 * @param {string} nameOrAlias - {@link Command#name} or {@link Command#aliases} alias
	 * @returns {boolean}
	 */
	reloadCommand(nameOrAlias)
	{
		let name = this._bot.commands.findByNameOrAlias(nameOrAlias).name;
		if (!name) return false;
		let commandLocation = this._bot.commands.get(name).classloc;
		delete require.cache[require.resolve(commandLocation)];
		let Command = require(commandLocation).default;
		let command = new Command(this._bot);
		command.classloc = commandLocation;
		this._bot.commands.register(command, command.name, true);
		console.log(`Command '${command.name}' reloaded.`); // eslint-disable-line no-console
		return true;
	}
}
