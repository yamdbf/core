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
		/**
		 * Bot instance
		 * @memberof CommandLoader
		 * @type {Bot}
		 * @name bot
		 * @instance
		 */
		this.bot = bot;
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
		if (this.bot.commands.size > 0) this.bot.commands = new CommandRegistry();
		let commandFiles = [];
		commandFiles.push(...glob.sync(`${path.join(__dirname, './base')}/**/*.js`));
		commandFiles.push(...glob.sync(`${this.bot.commandsDir}/**/*.js`));
		let loadedCommands = 0;
		commandFiles.forEach(fileName =>
		{
			let commandLocation = fileName.replace('.js', '');
			delete require.cache[require.resolve(commandLocation)];
			let Command = require(commandLocation).default;
			let command = new Command(this.bot);
			if (this.bot.disableBase.includes(command.name)) return;
			command.classloc = commandLocation;
			let overload;
			if (command.overload) overload = true;
			this.bot.commands.register(command, command.name);
			if (!overload)
			{
				loadedCommands++;
				console.log(`Command '${command.name}' loaded.`); // eslint-disable-line no-console
			}
			else
			{
				console.log(`Command '${command.name}' overloaded.`); // eslint-disable-line no-console
			}
		});
		console.log(`Loaded ${loadedCommands} commands in ${this.bot.commands.groups.length} groups.`); // eslint-disable-line no-console
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
		let name = this.bot.commands.findByNameOrAlias(nameOrAlias).name;
		if (!name) return false;
		let commandLocation = this.bot.commands.get(name).classloc;
		delete require.cache[require.resolve(commandLocation)];
		let Command = require(commandLocation).default;
		let command = new Command(this.bot);
		command.classloc = commandLocation;
		this.bot.commands.register(command, command.name, true);
		console.log(`Command '${command.name}' reloaded.`); // eslint-disable-line no-console
		return true;
	}
}
