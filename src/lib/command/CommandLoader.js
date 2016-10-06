'use babel';
'use strict';

import glob from 'glob';
import path from 'path';

import CommandRegistry from './CommandRegistry';

// Load all commands from the bots commandsDir
export default class CommandLoader
{
	constructor(bot)
	{
		this.bot = bot;
	}

	loadCommands()
	{
		if (this.bot.commands.size > 0) this.bot.commands = new CommandRegistry();
		let commandFiles = [];
		commandFiles.push(...glob.sync(`${path.join(__dirname, './base')}/**/*.js`));
		commandFiles.push(...glob.sync(`${this.bot.commandsDir}/**/*.js`));
		commandFiles.forEach(fileName =>
		{
			let commandLocation = fileName.replace('.js', '');
			delete require.cache[require.resolve(commandLocation)];
			let Command = require(commandLocation).default;
			let command = new Command(this.bot);
			command.classloc = commandLocation;
			this.bot.commands.register(command, command.name);
		});
	}

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
		return true;
	}
}
