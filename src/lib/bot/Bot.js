'use babel';
'use strict';

import { Client } from 'discord.js';
import LocalStorage from '../storage/LocalStorage';
import GuildStorageLoader from '../storage/GuildStorageLoader';
import GuildStorageRegistry from '../storage/GuildStorageRegistry';
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
		this.selfbot = options.selfbot || false;
		this.config = require('../../config.json');

		if (!this.token) throw new Error('You must provide a token for the bot.');
		if (!this.commandsDir) throw new Error('You must provide a directory to load commands from via commandDir');

		this.storage = new LocalStorage('bot-storage');
		if (!this.storage.exists('defaultGuildSettings')) // eslint-disable-line curly
			this.storage.setItem('defaultGuildSettings',
				require('../storage/defaultGuildSettings.json'));

		this.guildSettingStorage = new LocalStorage('guild-storage');
		this.guildStorageLoader = new GuildStorageLoader(this);
		this.guildStorages = new GuildStorageRegistry();

		this.commandLoader = new CommandLoader(this);
		this.commands = new CommandRegistry();
		this.dispatcher = new CommandDispatcher(this);

		this.commandLoader.loadCommands();
	}

	// Login and create necessary event listeners
	start()
	{
		this.login(this.token);

		this.on('ready', () =>
		{
			console.log('Ready'); // eslint-disable-line no-console
			this.user.setStatus(null, this.statusText);
			this.guildStorageLoader.loadStorages(this.guildSettingStorage);
		});

		this.on('guildCreate', () =>
		{
			this.guildStorageLoader.initNewGuilds(this.guildSettingStorage);
		});

		this.on('guildDelete', (guild) =>
		{
			this.guildStorages.delete(guild.id);
			this.guildSettingStorage.removeItem(guild.id);
		});
	}

	// Set the value of a default setting key and push it to all guild
	// setting storages
	setDefaultSetting(key, value)
	{
		let defaults = this.storage.getItem('defaultGuildSettings');
		if (!defaults) return;
		defaults[key] = value;
		this.storage.setItem('defaultGuildSettings', defaults);
		this.guildStorages.forEach(guild =>
		{
			if (!guild.settingExists(key)) guild.setSetting(key, value);
		});
	}

	// See if a guild default setting exists
	defaultSettingExists(key)
	{
		return !!this.storage.getItem('defaultGuildSettings')[key];
	}

	// Shortcut to return the command prefix for the given guild
	getPrefix(guild)
	{
		return this.guildStorages.get(guild).getSetting('prefix') || null;
	}
}
