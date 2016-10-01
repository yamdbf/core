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
		if (this.bot.commands.length > 0) this.bot.commands = new CommandRegistry();
		let cmds = [];
		let commandFiles = [];
		commandFiles.push(...glob.sync(`${path.join(__dirname, './basecommands')}/**/*.js`));
		commandFiles.push(...glob.sync(`${this.bot.commandsDir}/**/*.js`));
		commandFiles.forEach(fileName =>
		{
			let command = fileName.replace('.js', '');
			delete require.cache[require.resolve(`${command}`)];
			cmds.push(require(`${command}`).default);
		});
		cmds.forEach(Command =>
		{
			let command = new Command(this.bot);
			this.bot.commands.register(command, command.name);
		});
	}
}
