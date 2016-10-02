'use babel';
'use strict';

import { Client } from 'discord.js';
import LocalStorage from '../storage/LocalStorage';
import GuildStorageLoader from '../storage/GuildStorageLoader';
import CommandLoader from '../command/CommandLoader';
import CommandRegistry from '../command/CommandRegistry';
import CommandDispatcher from '../command/CommandDispatcher';

export default class Bot extends Client
{
	constructor(options = null)
	{
		super();

		this.name = options.name || 'botname';
		this.token = options.token;
		this.commandsDir = options.commandsDir;
		this.statusText = options.statusText || '@mention help';

		if (!this.token) throw new Error('You must provide a token for the bot.');
		if (!this.commandsDir) throw new Error('You must provide a directory to load commands from via commandDir');

		this.botStorage = new LocalStorage('bot-storage');

		this.guildSettingStorage = new LocalStorage('guild-settings');
		this.guildStorages = new GuildStorageLoader();

		this.commandLoader = new CommandLoader(this);
		this.commands = new CommandRegistry();
		this.dispatcher = new CommandDispatcher(this);

		this.commandLoader.loadCommands();

		this.settings = require('../../settings.json');
	}

	// Login and create necessary event listeners
	start()
	{
		this.login(this.token);

		this.on('ready', () =>
		{
			console.log('Ready'); // eslint-disable-line no-console
			this.user.setStatus(null, this.statusText);
			this.guildStorages.load(this, this.guildSettingStorage);
		});

		this.on('guildCreate', () =>
		{
			this.guildStorages.initNewGuilds(this, this.guildSettingStorage);
		});

		this.on('guildDelete', (guild) =>
		{
			this.guildStorages.delete(guild.id);
			this.guildSettingStorage.removeItem(guild.id);
		});
	}

	// Shortcut to return the command prefix for the given guild
	getPrefix(guild)
	{
		return this.guildStorages.get(guild).getSetting('prefix') || null;
	}
}
