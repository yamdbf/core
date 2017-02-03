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
 * @param {BotOptions} botOptions - Object containing required bot properties
 * @param {external:ClientOptions} [clientOptions] - Discord.js ClientOptions
 */
export default class Bot extends Client
{
	constructor(botOptions = null, clientOptions)
	{
		super(clientOptions);

		/** @type {string} */
		this._token = botOptions.token;

		/**
		 * The name of the Bot
		 * @memberof Bot
		 * @type {string}
		 * @name name
		 * @instance
		 */
		this.name = botOptions.name || 'botname';

		/**
		 * Directory to find command class files. Optional
		 * if bot is passive. See: {@link Bot#passive}
		 * @memberof Bot
		 * @type {string}
		 * @name commandsDir
		 * @instance
		 */
		this.commandsDir = botOptions.commandsDir || null;

		/**
		 * Status text for the bot
		 * @memberof Bot
		 * @type {?string}
		 * @name statusText
		 * @instance
		 */
		this.statusText = botOptions.statusText || null;

		/**
		 * Text to output when the bot is ready
		 * @memberof Bot
		 * @type {string}
		 * @name readyText
		 * @instance
		 */
		this.readyText = botOptions.readyText || 'Ready!';

		/**
		 * Whether or not a generic 'command not found' message
		 * should be given in DMs to instruct the user to
		 * use the `help` command. Set to false to disable
		 * this message
		 * @name Bot#noCommandErr
		 * @type {string}
		 * @instance
		 */
		this.noCommandErr = botOptions.noCommandErr === undefined ? true : botOptions.noCommandErr;

		/**
		 * Whether or not the bot is a selfbot
		 * @memberof Bot
		 * @type {boolean}
		 * @name selfbot
		 * @instance
		 */
		this.selfbot = botOptions.selfbot || false;

		/**
		 * Whether or not this bot is passive. Passive bots
		 * will not register a command dispatcher or a message
		 * listener. This allows passive bots to be created that
		 * do not respond to any commands but are able to perform
		 * actions based on whatever the framework user wants
		 * @memberof Bot
		 * @type {boolean}
		 * @name passive
		 * @instance
		 */
		this.passive = botOptions.passive || false;

		/**
		 * Bot version, best taken from package.json
		 * @memberof Bot
		 * @type {string}
		 * @name version
		 * @instance
		 */
		this.version = botOptions.version || '0.0.0';

		/**
		 * Object containing token and owner ids
		 * @memberof Bot
		 * @type {Object}
		 * @name config
		 * @instance
		 * @property {string} token - Discord login token for the bot
		 * @property {string[]} owner - Array of owner id strings
		 */
		this.config = botOptions.config || null;

		/**
		 * Array of base command names to skip when loading commands. Base commands
		 * may only be disabled by name, not by alias
		 * @memberof Bot
		 * @type {string[]}
		 * @name disableBase
		 * @instance
		 */
		this.disableBase = botOptions.disableBase || [];

		/** @type {LocalStorage} */
		this._guildDataStorage = new LocalStorage('storage/guild-storage');

		/** @type {LocalStorage} */
		this._guildSettingStorage = new LocalStorage('storage/guild-settings');

		/** @type {GuildStorageLoader} */
		this._guildStorageLoader = new GuildStorageLoader(this);

		/** @type {CommandLoader} */
		this._commandLoader = new CommandLoader(this);

		/**
		 * Bot-specific storage
		 * @memberof Bot
		 * @type {LocalStorage}
		 * @name storage
		 * @instance
		 */
		this.storage = new LocalStorage('storage/bot-storage');

		/**
		 * [Collection]{@link external:Collection} containing all GuildStorage instances
		 * @memberof Bot
		 * @type {GuildStorageRegistry<string, GuildStorage>}
		 * @name guildStorages
		 * @instance
		 */
		this.guildStorages = new GuildStorageRegistry();

		/**
		 * [Collection]{@link external:Collection} containing all loaded commands
		 * @memberof Bot
		 * @type {CommandRegistry<string, Command>}
		 * @name commands
		 * @instance
		 */
		this.commands = new CommandRegistry();

		/**
		 * @typedef {Object} DefaultGuildSettings - The default settings to apply to new guilds.
		 * Stored under the key <code>'defaultGuildSettings'</code> in {@link Bot#storage}
		 * @property {string} prefix='/' - Prefix to prepend commands
		 * @property {Array} [disabledGroups=[]] - Command groups to ignore
		 */

		// Load defaultGuildSettings into storage the first time the bot is run
		if (!this.storage.exists('defaultGuildSettings')) // eslint-disable-line curly
			this.storage.setItem('defaultGuildSettings',
				require('../storage/defaultGuildSettings.json'));

		/** @type {CommandDispatcher} */
		this._dispatcher = new CommandDispatcher(this);

		// Make some asserts
		if (!this._token) throw new Error('You must provide a token for the bot.');
		if (!this.commandsDir && !this.passive) throw new Error('You must provide a directory to load commands from via commandDir');
		if (!this.config) throw new Error('You must provide a config containing token and owner ids.');
		if (!this.config.owner) throw new Error('You must provide config array of owner ids.');
		if (typeof this.config.owner !== 'array') throw new Error('Config owner option must be an arrray of user ids.');

		// Load commands
		if (!this.passive) this.loadCommand('all');
	}

	/**
	 * Loads/reloads all/specific commands
	 * @memberof Bot
	 * @instance
	 * @param {string} command - The name of a command to reload, or 'all' to load all commands
	 */
	loadCommand(command)
	{
		if (!command) throw new Error(`You must provide a command name to load, or 'all' to load all commands`);
		if (command === 'all') this._commandLoader.loadCommands();
		else this._commandLoader.reloadCommand(command);
	}

	/**
	 * Logs the Bot in and registers some event handlers
	 * @memberof Bot
	 * @instance
	 * @returns {Bot}
	 */
	start()
	{
		this.login(this._token);

		this.once('ready', () =>
		{
			console.log(this.readyText); // eslint-disable-line no-console
			this.user.setGame(this.statusText);

			// Load all guild storages
			this._guildStorageLoader.loadStorages(this._guildDataStorage, this._guildSettingStorage);
		});

		this.on('guildCreate', () =>
		{
			this._guildStorageLoader.initNewGuilds(this._guildDataStorage, this._guildSettingStorage);
		});

		this.on('guildDelete', (guild) =>
		{
			this.guildStorages.delete(guild.id);
			this._guildDataStorage.removeItem(guild.id);
			this._guildSettingStorage.removeItem(guild.id);
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
		if (!guild) return null;
		return this.guildStorages.get(guild).getSetting('prefix') || null;
	}
}

/**
 * @typedef {Object} BotOptions Object containing required {@link Bot} properties to be
 * passed to a Bot on construction
 * @property {string} [name='botname'] - See: {@link Bot#name}
 * @property {string} token - See: {@link Bot#token}
 * @property {string} [commandsDir] - See: {@link Bot#commandsDir}
 * @property {string} [statusText=null] - See: {@link Bot#statusText}
 * @property {string} [readyText='Ready!'] - See: {@link Bot#readyText}
 * @property {boolean} [noCommandErr=true] - See: {@link Bot#noCommandErr}
 * @property {boolean} [selfbot=false] - See: {@link Bot#selfbot}
 * @property {boolean} [passive=false] - see {@link Bot#passive}
 * @property {string} [version='0.0.0'] - See: {@link Bot#version}
 * @property {Object} config - See: {@link Bot#config}
 * @property {string[]} [disableBase=[]] - See: {@link Bot#disableBase}
 */
