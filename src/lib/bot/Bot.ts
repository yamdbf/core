import { Client, ClientOptions, Guild, Message, Channel, Emoji, User, GuildMember, Collection, MessageReaction, Role, UserResolvable } from 'discord.js';
import { BotOptions } from '../types/BotOptions';
import { LocalStorage } from '../storage/LocalStorage';
import { GuildStorage } from '../storage/GuildStorage';
import { GuildStorageLoader } from '../storage/GuildStorageLoader';
import { GuildStorageRegistry } from '../storage/GuildStorageRegistry';
import { Command } from '../command/Command';
import { CommandLoader } from '../command/CommandLoader';
import { CommandRegistry } from '../command/CommandRegistry';
import { CommandDispatcher } from '../command/CommandDispatcher';

/**
 * The Discord.js Client instance. Contains bot-specific [storage]{@link Bot#storage},
 * guild specific [storages]{@link Bot#guildStorages}, and contains important
 * fields for access within commands
 * @class Bot
 * @extends {external:Client}
 * @param {BotOptions} botOptions - Object containing required bot properties
 * @param {external:ClientOptions} [clientOptions] - Discord.js ClientOptions
 */
export class Bot extends Client
{
	public name: string;
	public commandsDir: string;
	public statusText: string;
	public readyText: string;
	public noCommandErr: boolean;
	public selfbot: boolean;
	public passive: boolean;
	public version: string;
	public disableBase: string[];
	public config: any;

	public storage: LocalStorage;
	public guildStorages: GuildStorageRegistry<string, GuildStorage>;
	public commands: CommandRegistry<this, string, Command<this>>;

	private _token: string;
	private _guildDataStorage: LocalStorage;
	private _guildSettingStorage: LocalStorage;
	private _guildStorageLoader: GuildStorageLoader<this>;
	private _commandLoader: CommandLoader<this>;
	private _dispatcher: CommandDispatcher<this>;

	public constructor(botOptions: BotOptions, clientOptions?: ClientOptions)
	{
		super(clientOptions);

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
		 * @type {string}
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

		this._guildDataStorage = new LocalStorage('storage/guild-storage');
		this._guildSettingStorage = new LocalStorage('storage/guild-settings');
		this._guildStorageLoader = new GuildStorageLoader(this);

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
		this.commands = new CommandRegistry<this, string, Command<this>>();

		// Load defaultGuildSettings into storage the first time the bot is run
		if (!this.storage.exists('defaultGuildSettings'))
			this.storage.setItem('defaultGuildSettings',
				require('../storage/defaultGuildSettings.json'));

		this._commandLoader = !this.passive ? new CommandLoader(this) : null;
		this._dispatcher = !this.passive ? new CommandDispatcher<this>(this) : null;

		// Make some asserts
		if (!this._token) throw new Error('You must provide a token for the bot.');
		if (!this.commandsDir && !this.passive) throw new Error('You must provide a directory to load commands from via commandDir');
		if (!this.config) throw new Error('You must provide a config containing token and owner ids.');
		if (!this.config.owner) throw new Error('You must provide config array of owner ids.');
		if (!(this.config.owner instanceof Array)) throw new TypeError('Config owner option must be an arrray of user ids.');

		// Load commands
		if (!this.passive) this.loadCommand('all');
	}

	/**
	 * Returns whether or not the given user is an owner
	 * of the bot
	 * @memberof Bot
	 * @instance
	 * @param {User} user User to check
	 */
	public isOwner(user: User): boolean
	{
		return this.config.owner.includes(user.id);
	}

	/**
	 * Loads/reloads all/specific commands
	 * @memberof Bot
	 * @instance
	 * @param {string} command - The name of a command to reload, or 'all' to load all commands
	 */
	public loadCommand(command: string): void
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
	public start(): this
	{
		this.login(this._token);

		this.once('ready', () =>
		{
			console.log(this.readyText);
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
	 * @param {any} value - The value to use in settings storage
	 * @returns {Bot}
	 */
	public setDefaultSetting(key: string, value: any): this
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
	public removeDefaultSetting(key: string): this
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
	public defaultSettingExists(key: string): boolean
	{
		return !!this.storage.getItem('defaultGuildSettings')[key];
	}

	/**
	 * Shortcut to return the command prefix for the provided guild
	 * @memberof Bot
	 * @instance
	 * @param {(external:Guild|string)} guild The guild or guild id to get the prefix of
	 * @returns {string|null}
	 */
	public getPrefix(guild: Guild | string): string
	{
		if (!guild) return null;
		return this.guildStorages.get(<Guild> guild).getSetting('prefix') || null;
	}

	/**
	 * Clean out any guild storage/settings that no longer have
	 * an associated guild
	 * @memberof Bot
	 * @instance
	 */
	public sweepStorages(): void
	{
		this._guildStorageLoader.cleanGuilds(this._guildDataStorage, this._guildSettingStorage);
	}

//#region Discord.js events

	public on(event: 'channelCreate', listener: (channel: Channel) => void): this;
	public on(event: 'channelDelete', listener: (channel: Channel) => void): this;
	public on(event: 'channelPinsUpdate', listener: (channel: Channel, time: Date) => void): this;
	public on(event: 'channelUpdate', listener: (oldChannel: Channel, newChannel: Channel) => void): this;
	public on(event: 'debug', listener: (info: string) => void): this;
	public on(event: 'disconnect', listener: (event: any) => void): this;
	public on(event: 'emojiCreate', listener: (emoji: Emoji) => void): this;
	public on(event: 'emojiCreate', listener: (emoji: Emoji) => void): this;
	public on(event: 'emojiUpdate', listener: (oldEmoji: Emoji, newEmoji: Emoji) => void): this;
	public on(event: 'error', listener: (error: Error) => void): this;
	public on(event: 'guildBanAdd', listener: (guild: Guild, user: User) => void): this;
	public on(event: 'guildBanRemove', listener: (guild: Guild, user: User) => void): this;
	public on(event: 'guildCreate', listener: (guild: Guild) => void): this;
	public on(event: 'guildDelete', listener: (guild: Guild) => void): this;
	public on(event: 'guildMemberAdd', listener: (member: GuildMember) => void): this;
	public on(event: 'guildMemberAvailable', listener: (member: GuildMember) => void): this;
	public on(event: 'guildMemberRemove', listener: (member: GuildMember) => void): this;
	public on(event: 'guildMembersChunk', listener: (members: Collection<string, GuildMember>, guild: Guild) => void): this;
	public on(event: 'guildMemberSpeaking', listener: (member: GuildMember, speaking: boolean) => void): this;
	public on(event: 'guildMemberUpdate', listener: (oldMember: GuildMember, newMember: GuildMember) => void): this;
	public on(event: 'guildUnavailable', listener: (guild: Guild) => void): this;
	public on(event: 'guildUpdate', listener: (oldGuild: Guild, newGuild: Guild) => void): this;
	public on(event: 'message', listener: (message: Message) => void): this;
	public on(event: 'messageDelete', listener: (message: Message) => void): this;
	public on(event: 'messageDeleteBulk', listener: (messages: Collection<string, Message>) => void): this;
	public on(event: 'messageReactionAdd', listener: (messageReaction: MessageReaction, user: User) => void): this;
	public on(event: 'messageReactionRemove', listener: (messageReaction: MessageReaction, user: User) => void): this;
	public on(event: 'messageReactionRemoveAll', listener: (message: Message) => void): this;
	public on(event: 'messageUpdate', listener: (oldMessage: Message, newMessage: Message) => void): this;
	public on(event: 'presenceUpdate', listener: (oldMember: GuildMember, newMember: GuildMember) => void): this;
	public on(event: 'ready', listener: () => void): this;
	public on(event: 'reconnecting', listener: () => void): this;
	public on(event: 'roleCreate', listener: (role: Role) => void): this;
	public on(event: 'roleDelete', listener: (role: Role) => void): this;
	public on(event: 'roleUpdate', listener: (oldRole: Role, newRole: Role) => void): this;
	public on(event: 'typingStart', listener: (channel: Channel, user: User) => void): this;
	public on(event: 'typingStop', listener: (channel: Channel, user: User) => void): this;
	public on(event: 'userNoteUpdate', listener: (user: UserResolvable, oldNote: string, newNote: string) => void): this;
	public on(event: 'userUpdate', listener: (oldUser: User, newUser: User) => void): this;
	public on(event: 'voiceStateUpdate', listener: (oldMember: GuildMember, newMember: GuildMember) => void): this;
	public on(event: 'warn', listener: (info: string) => void): this;

//#endregion

	public on(event: 'command', listener: (name: string, args: any[], execTime: number, message: Message) => void): this;
	public on(event: 'blacklistAdd', listener: (user: User, global: boolean) => void): this;
	public on(event: 'blacklistRemove', listener: (user: User, global: boolean) => void): this;

	/**
	 * Emitted whenever a command is successfully called
	 * @memberof Bot
	 * @instance
	 * @event event:command
	 * @param {string} name Name of the called command
	 * @param {any[]} args Args passed to the called command
	 * @param {number} execTime Time command took to execute
	 * @param {external:Message} message Message that triggered the command
	 */

	/**
	 * Emitted whenever a user is blacklisted
	 * @memberof Bot
	 * @instance
	 * @event event:blacklistAdd
	 * @param {User} user User who was blacklisted
	 * @param {boolean} global Whether or not blacklisting is global
	 */

	/**
	 * Emitted whenever a user is removed from the blacklist
	 * @memberof Bot
	 * @instance
	 * @event event:blacklistRemove
	 * @param {User} user User who was removed
	 * @param {boolean} global Whether or not removal is global
	 */
	public on(event: string, listener: Function): this
	{
		return super.on(event, listener);
	}
}
