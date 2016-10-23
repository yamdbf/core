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
			const commandLocation = fileName.replace('.js', '');
			delete require.cache[require.resolve(commandLocation)];
			const Command = require(commandLocation).default;
			const _command = new Command(this._bot);
			if (this._bot.disableBase.includes(_command.name)) return;
			_command._classloc = commandLocation;
			if (_command.overloads)
			{
				if (!this._bot.commands.has(_command.overloads)) // eslint-disable-line curly
					throw new Error(`Command "${_command.overloads}" does not exist to be overloaded.`);
				this._bot.commands.delete(_command.overloads);
				this._bot.commands.register(_command, _command.name);
				console.log(`Command '${_command.name}' loaded, overloading command '${_command.overloads}'.`); // eslint-disable-line no-console
			}
			else
			{
				this._bot.commands.register(_command, _command.name);
				loadedCommands++;
				console.log(`Command '${_command.name}' loaded.`); // eslint-disable-line no-console
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
		const name = this._bot.commands.findByNameOrAlias(nameOrAlias).name;
		if (!name) return false;
		const commandLocation = this._bot.commands.get(name)._classloc;
		delete require.cache[require.resolve(commandLocation)];
		const Command = require(commandLocation).default;
		const _command = new Command(this._bot);
		_command._classloc = commandLocation;
		this._bot.commands.register(_command, _command.name, true);
		console.log(`Command '${_command.name}' reloaded.`); // eslint-disable-line no-console
		return true;
	}
}
