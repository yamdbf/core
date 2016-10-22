'use babel';
'use strict';

import { Client } from 'discord.js';
import LocalStorage from '../storage/LocalStorage';
import GuildStorageLoader from '../storage/GuildStorageLoader';
import GuildStorageRegistry from '../storage/GuildStorageRegistry';
import CommandLoader from '../command/CommandLoader';
import CommandRegistry from '../command/CommandRegistry';
import CommandDispatcher from '../command/CommandDispatcher';

/**
 * The Discord.js Client instance. Contains bot-specific [storage]{@link Bot#storage},
 * guild specific [storages]{@link Bot#guildStorages}, and contains important
 * fields for access within commands
 * @class Bot
 * @extends {external:Client}
 * @param {BotOptions} options - Object containing required bot properties
 */
export default class Bot extends Client
{
	constructor(options = null)
	{
		super();

		/**
		 * The name of the Bot
		 * @memberof Bot
		 * @type {string}
		 * @name name
		 * @instance
		 */
		this.name = options.name || 'botname';

		/**
		 * Discord login token for the Bot
		 * @memberof Bot
		 * @type {string}
		 * @name token
		 * @instance
		 */
		this.token = options.token;

		/**
		 * Directory to find command class files
		 * @memberof Bot
		 * @type {string}
		 * @name commandsDir
		 * @instance
		 */
		this.commandsDir = options.commandsDir;

		/**
		 * Status text for the bot
		 * @memberof Bot
		 * @type {string}
		 * @name statusText
		 * @instance
		 */
		this.statusText = options.statusText || null;

		/**
		 * Whether or not the bot is a selfbot
		 * @memberof Bot
		 * @type {boolean}
		 * @name selfbot
		 * @instance
		 */
		this.selfbot = options.selfbot || false;

		/**
		 * Bot version, best taken from package.json
		 * @memberof Bot
		 * @type {string}
		 * @name version
		 * @instance
		 */
		this.version = options.version || '0.0.0';

		/**
		 * Object containing token and owner ids
		 * @memberof Bot
		 * @type {Object}
		 * @name config
		 * @instance
		 * @property {string} token - Discord login token for the bot
		 * @property {string[]} owner - Array of owner id strings
		 */
		this.config = options.config || null;

		/**
		 * Array of base command names to skip when loading commands. Base commands
		 * may only be disabled by name, not by alias
		 * @memberof Bot
		 * @type {string[]}
		 * @name disableBase
		 * @instance
		 */
		this.disableBase = options.disableBase || [];

		// Make some asserts
		if (!this.token) throw new Error('You must provide a token for the bot.');
		if (!this.commandsDir) throw new Error('You must provide a directory to load commands from via commandDir');
		if (!this.config) throw new Error('You must provide a config containing token and owner ids.');
		if (this.disableBase.includes('help')) throw new Error('Help command may be overloaded but not disabled. Check your disableBase');

		/**
		 * Bot-specific storage available everywhere that has access
		 * to the Bot instance
		 * @memberof Bot
		 * @type {LocalStorage}
		 * @name storage
		 * @instance
		 */
		this.storage = new LocalStorage('storage/bot-storage');

		/**
		 * @typedef {Object} defaultGuildSettings - The default settings to apply to new guilds.
		 * Stored under the key <code>'defaultGuildSettings'</code> in {@link Bot#storage}
		 * @property {string} [prefix='/'] - Prefix to prepend commands
		 * @property {Array} [disabledGroups=[]] - Command groups to ignore
		 */

		// Load defaultGuildSettings into storage the first time the bot is run
		if (!this.storage.exists('defaultGuildSettings')) // eslint-disable-line curly
			this.storage.setItem('defaultGuildSettings',
				require('../storage/defaultGuildSettings.json'));

		/**
		 * The storage that holds all persistent data for each guild-specific storage
		 * @memberof Bot
		 * @type {LocalStorage}
		 * @name guildDataStorage
		 * @instance
		 * @see {@link Bot#guildStorages}
		 */
		this.guildDataStorage = new LocalStorage('storage/guild-storage');

		/**
		 * The storage that holds all persistent data for each guild's settings
		 * @memberof Bot
		 * @type {LocalStorage}
		 * @name guildSettingStorage
		 * @instance
		 * @see {@link Bot#guildStorages}
		 */
		this.guildSettingStorage = new LocalStorage('storage/guild-settings');

		/**
		 * Loads all guild-specific storages from persistent storage into an
		 * accessible Collection of GuildStorage objects
		 * @memberof Bot
		 * @type {GuildStorageLoader}
		 * @name guildStorageLoader
		 * @instance
		 */
		this.guildStorageLoader = new GuildStorageLoader(this);

		/**
		 * Collection containing all GuildStorage instances
		 * @memberof Bot
		 * @type {GuildStorageRegistry<string, GuildStorage>}
		 * @name guildStorages
		 * @instance
		 */
		this.guildStorages = new GuildStorageRegistry();

		/**
		 * Loads all base commands and commands from the user-specified
		 * commandsDir directory
		 * @memberof Bot
		 * @type {CommandLoader}
		 * @name commandLoader
		 * @instance
		 * @see {@link Command}
		 */
		this.commandLoader = new CommandLoader(this);

		/**
		 * [Collection]{@link external:Collection} containing all loaded commands
		 * @memberof Bot
		 * @type {CommandRegistry<string, Command>}
		 * @name commands
		 * @instance
		 */
		this.commands = new CommandRegistry();

		/**
		 * Dispatcher that handles detection and execution of command actions
		 * @memberof Bot
		 * @type {CommandDispatcher}
		 * @name dispatcher
		 * @instance
		 */
		this.dispatcher = new CommandDispatcher(this);

		// Load commands
		this.commandLoader.loadCommands();
	}

	/**
	 * Logs the Bot in and registers some event handlers
	 * @memberof Bot
	 * @instance
	 * @returns {Bot}
	 */
	start()
	{
		this.login(this.token);

		this.on('ready', () =>
		{
			console.log('Ready'); // eslint-disable-line no-console
			this.user.setStatus(null, this.statusText);

			// Load all guild storages
			this.guildStorageLoader.loadStorages(this.guildDataStorage, this.guildSettingStorage);
		});

		this.on('guildCreate', () =>
		{
			this.guildStorageLoader.initNewGuilds(this.guildDataStorage, this.guildSettingStorage);
		});

		this.on('guildDelete', (guild) =>
		{
			this.guildStorages.delete(guild.id);
			this.guildDataStorage.removeItem(guild.id);
			this.guildSettingStorage.removeItem(guild.id);
		});

		return this;
	}

	/**
	 * Set the value of a default setting key and push it to all guild
	 * setting storages. Will not overwrite a setting in guild settings
	 * storage if there is already an existing key with the given value
	 * @memberof Bot
	 * @instance
	 * @param {string} key - The key to use in settings storage
	 * @param {string} value - The value to use in settings storage
	 * @returns {Bot}
	 */
	setDefaultSetting(key, value)
	{
		this.storage.setItem(`defaultGuildSettings/${key}`, value);
		this.guildStorages.forEach(guild =>
		{
			if (!guild.settingExists(key)) guild.setSetting(key, value);
		});
		return this;
	}

	/**
	 * Remove a defaultGuildSettings item. Will not remove from ALL guild
	 * settings, but will prevent the item from being added to new guild
	 * settings storage upon creation
	 * @memberof Bot
	 * @instance
	 * @param {string} key - The key to use in settings storage
	 * @returns {Bot}
	 */
	removeDefaultSetting(key)
	{
		this.storage.removeItem(`defaultGuildSettings/${key}`);
		return this;
	}

	/**
	 * See if a guild default setting exists
	 * @memberof Bot
	 * @instance
	 * @param {string} key - The key in storage to check
	 * @returns {boolean}
	 */
	defaultSettingExists(key)
	{
		return !!this.storage.getItem('defaultGuildSettings')[key];
	}

	/**
	 * Shortcut to return the command prefix for the provided guild
	 * @memberof Bot
	 * @instance
	 * @param {(external:Guild|string)} guild - The guild or guild id to get the prefix of
	 * @returns {string|null}
	 */
	getPrefix(guild)
	{
		return this.guildStorages.get(guild).getSetting('prefix') || null;
	}
}

/**
 * @typedef {Object} BotOptions Object containing required {@link Bot} properties to be
 * passed to a Bot on construction
 * @property {string} [name='botname'] - See: {@link Bot#name}
 * @property {string} token - See: {@link Bot#token}
 * @property {string} commandsDir - See: {@link Bot#commandsDir}
 * @property {string} [statusText=null] - See: {@link Bot#statusText}
 * @property {boolean} [selfbot=false] - See: {@link Bot#selfbot}
 * @property {string} [version='0.0.0'] - See: {@link Bot#version}
 * @property {Object} config - See: {@link Bot#config}
 * @property {string[]} [disableBase=[]] - See: {@link Bot#disableBase}
 */
