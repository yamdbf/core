import { Channel, Client, ClientOptions, Collection, Emoji, Guild, GuildMember, Message, MessageReaction, Role, User, UserResolvable } from 'discord.js';
import { Command } from '../command/Command';
import { CommandDispatcher } from '../command/CommandDispatcher';
import { CommandLoader } from '../command/CommandLoader';
import { CommandRegistry } from '../command/CommandRegistry';
import { RateLimiter } from '../command/RateLimiter';
import { GuildStorageLoader } from '../storage/GuildStorageLoader';
import { JSONProvider } from '../storage/JSONProvider';
import { StorageProvider } from '../storage/StorageProvider';
import { StorageFactory } from '../storage/StorageFactory';
import { BotOptions } from '../types/BotOptions';
import { ClientStorage } from '../types/ClientStorage';
import { MiddlewareFunction } from '../types/MiddlewareFunction';
import { StorageProviderConstructor } from '../types/StorageProviderConstructor';

/**
 * The YAMDBF Client through which you can access [storage]{@link Bot#storage}
 * and any of the properties available on a typical Discord.js Client instance
 * @extends {external:Client}
 * @param {BotOptions} botOptions Object containing required bot properties
 * @param {external:ClientOptions} [clientOptions] Discord.js ClientOptions
 */
export class Bot extends Client
{
	public name: string;
	public commandsDir: string;
	public statusText: string;
	public readyText: string;
	public unknownCommandError: boolean;
	public selfbot: boolean;
	public passive: boolean;
	public version: string;
	public disableBase: string[];
	public config: any;
	public provider: StorageProviderConstructor;
	public storageFactory: StorageFactory;
	public _middleware: MiddlewareFunction[];
	public _rateLimiter: RateLimiter;

	public storage: ClientStorage;
	public commands: CommandRegistry<this, string, Command<this>>;

	private _token: string;
	private _guildDataStorage: StorageProvider;
	private _guildSettingStorage: StorageProvider;
	private _guildStorageLoader: GuildStorageLoader<this>;
	private _commandLoader: CommandLoader<this>;
	private _dispatcher: CommandDispatcher<this>;

	public constructor(botOptions: BotOptions, clientOptions?: ClientOptions)
	{
		super(clientOptions);

		this._token = botOptions.token;

		/**
		 * The name of the Bot
		 * @name Bot#name
		 * @type {string}
		 */
		this.name = botOptions.name || 'botname';

		/**
		 * Directory to find command class files. Optional
		 * if bot is passive. See: {@link Bot#passive}
		 * @name Bot#commandsDir
		 * @type {string}
		 */
		this.commandsDir = botOptions.commandsDir || null;

		/**
		 * Status text for the bot
		 * @name Bot#statusText
		 * @type {string}
		 */
		this.statusText = botOptions.statusText || null;

		/**
		 * Text to output when the bot is ready
		 * @name Bot#readyText
		 * @type {string}
		 */
		this.readyText = botOptions.readyText || 'Ready!';

		/**
		 * Whether or not a generic 'command not found' message
		 * should be given in DMs to instruct the user to
		 * use the `help` command. `true` by default
		 * @name Bot#unknownCommandError
		 * @type {string}
		 * @instance
		 */
		this.unknownCommandError = botOptions.unknownCommandError === undefined ?
			true : botOptions.unknownCommandError;

		/**
		 * Whether or not the bot is a selfbot
		 * @name Bot#selfbot
		 * @type {boolean}
		 */
		this.selfbot = botOptions.selfbot || false;

		/**
		 * Whether or not this bot is passive. Passive bots
		 * will not register a command dispatcher or a message
		 * listener. This allows passive bots to be created that
		 * do not respond to any commands but are able to perform
		 * actions based on whatever the framework user wants
		 * @name Bot#passive
		 * @type {boolean}
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
		 * @name Bot#config
		 * @type {Object}
		 * @property {string} token - Discord login token for the bot
		 * @property {string[]} owner - Array of owner id strings
		 */
		this.config = botOptions.config || null;

		/**
		 * Array of base command names to skip when loading commands. Base commands
		 * may only be disabled by name, not by alias
		 * @name Bot#disableBase
		 * @type {string[]}
		 */
		this.disableBase = botOptions.disableBase || [];

		// Create the global RateLimiter instance if a ratelimit is specified
		if (botOptions.ratelimit)
			this._rateLimiter = new RateLimiter(botOptions.ratelimit, true);

		// Middleware function storage for the bot instance
		this._middleware = [];

		this.provider = botOptions.provider || JSONProvider;

		this._guildDataStorage = new this.provider('guild_storage');
		this._guildSettingStorage = new this.provider('guild_settings');
		this._guildStorageLoader = new GuildStorageLoader(this);

		this.storageFactory = new StorageFactory(this, this._guildDataStorage, this._guildSettingStorage);

		/**
		 * Client-specific storage. Also contains a `guilds` Collection property containing
		 * all GuildStorage instances
		 * @name Bot#storage
		 * @type {ClientStorage}
		 */
		this.storage = this.storageFactory.createClientStorage();

		/**
		 * [Collection]{@link external:Collection} containing all loaded commands
		 * @name Bot#commands
		 * @type {CommandRegistry<string, Command>}
		 */
		this.commands = new CommandRegistry<this, string, Command<this>>();

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
	 * Initialize storages, load default settings into storage if they're not there already
	 * and load guild storages for guilds
	 * @private
	 */
	private async init(): Promise<void>
	{
		await this.storage.init();
		await this._guildDataStorage.init();
		await this._guildSettingStorage.init();

		// Load defaultGuildSettings into storage the first time the bot is run
		if (typeof await this.storage.get('defaultGuildSettings') === 'undefined')
			await this.storage.set('defaultGuildSettings',
				require('../storage/defaultGuildSettings.json'));

		await this._guildStorageLoader.loadStorages(this._guildDataStorage, this._guildSettingStorage);
	}

	/**
	 * Returns whether or not the given user is an owner
	 * of the bot
	 * @method Bot#isOwner
	 * @param {User} user User to check
	 * @returns {boolean}
	 */
	public isOwner(user: User): boolean
	{
		return this.config.owner.includes(user.id);
	}

	/**
	 * Loads/reloads all/specific commands
	 * @method Bot#loadCommand
	 * @param {string} command The name of a command to reload, or 'all' to load all commands
	 */
	public loadCommand(command: string): void
	{
		if (!command) throw new Error(`You must provide a command name to load, or 'all' to load all commands`);
		if (command === 'all') this._commandLoader.loadCommands();
		else this._commandLoader.reloadCommand(command);
	}

	/**
	 * Logs the Bot in and registers some event handlers
	 * @method Bot#start
	 * @returns {Bot}
	 */
	public start(): this
	{
		this.login(this._token);

		this.once('ready', async () =>
		{
			await this.init();
			this.user.setGame(this.statusText);

			this.emit('waiting');
		});

		this.once('finished', () => this.emit('clientReady'));

		this.on('guildCreate', () =>
		{
			this._guildStorageLoader.initNewGuilds(this._guildDataStorage, this._guildSettingStorage);
		});

		this.on('guildDelete', (guild) =>
		{
			this.storage.guilds.delete(guild.id);
			this._guildDataStorage.remove(guild.id);
			this._guildSettingStorage.remove(guild.id);
		});

		return this;
	}

	/**
	 * Set the value of a default setting key and push it to all guild
	 * setting storages. Will not overwrite a setting in guild settings
	 * storage if there is already an existing key with the given value
	 * @method Bot#setDefaultSetting
	 * @param {string} key The key to use in settings storage
	 * @param {any} value The value to use in settings storage
	 * @returns {Promise<Bot>}
	 */
	public async setDefaultSetting(key: string, value: any): Promise<this>
	{
		await this.storage.set(`defaultGuildSettings.${key}`, value);
		for (const guildStorage of this.storage.guilds.values())
			if (typeof await guildStorage.settings.get(key) === 'undefined')
				await guildStorage.settings.set(key, value);

		return this;
	}

	/**
	 * Remove a defaultGuildSettings item. Will not remove from ALL guild
	 * settings, but will prevent the item from being added to new guild
	 * settings storage upon creation
	 * @method Bot#removeDefaultSetting
	 * @param {string} key The key to use in settings storage
	 * @returns {Promise<Bot>}
	 */
	public async removeDefaultSetting(key: string): Promise<this>
	{
		await this.storage.remove(`defaultGuildSettings.${key}`);
		return this;
	}

	/**
	 * See if a default guild setting exists
	 * @method Bot#defaultSettingsExists
	 * @param {string} key The key in storage to check
	 * @returns {Promise<boolean>}
	 */
	public async defaultSettingExists(key: string): Promise<boolean>
	{
		return typeof await this.storage.get(`defaultGuildSettings.${key}`) !== 'undefined';
	}

	/**
	 * Shortcut to return the command prefix for the provided guild
	 * @method Bot#getPrefix
	 * @param {external:Guild} guild The guild to get the prefix of
	 * @returns {Promise<?string>}
	 */
	public async getPrefix(guild: Guild): Promise<string>
	{
		if (!guild) return null;
		return (await this.storage.guilds.get(guild.id).settings.get('prefix')) || null;
	}

	/**
	 * Clean out any guild storage/settings that no longer have
	 * an associated guild
	 * @method Bot#sweepStorages
	 */
	public sweepStorages(): void
	{
		this._guildStorageLoader.cleanGuilds(this._guildDataStorage, this._guildSettingStorage);
	}

	/**
	 * Adds a middleware function to be used when any command is run
	 * to make modifications to args or determine if the command can
	 * be run. Takes a function that will receive the message object
	 * and the array of args.
	 *
	 * A middleware function must return an array where the first item
	 * is the message object and the second item is the args array.
	 * If a middleware function returns a string, or throws a string/error,
	 * it will be sent to the calling channel as a message and the command
	 * execution will be aborted. If a middleware function does not return
	 * anything or returns something other than an array or string, it will
	 * fail silently.
	 *
	 * Example:
	 * ```
	 * this.use((message, args) => [message, args.map(a => a.toUpperCase())]);
	 * ```
	 * This will add a middleware function to all commands that will attempt
	 * to transform all args to uppercase. This will of course fail if any
	 * of the args are not a string.
	 *
	 * Note: Middleware functions should only be added to the bot one time each,
	 * and thus should not be added within any sort of event or loop.
	 * Multiple middleware functions can be added to the via multiple calls
	 * to this method
	 * @method Bot#use
	 * @param {MiddlewareFunction} fn Middleware function. `(message, args) => [message, args]`
	 * @returns {Bot}
	 */
	public use(fn: MiddlewareFunction): this
	{
		this._middleware.push(fn);
		return this;
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
	public on(event: 'waiting', listener: () => void): this;
	public on(event: 'finished', listener: () => void): this;
	public on(event: 'clientReady', listener: () => void): this;

	/**
	 * Emitted whenever a command is successfully called
	 * @memberof Bot
	 * @event event:command
	 * @param {string} name Name of the called command
	 * @param {any[]} args Args passed to the called command
	 * @param {number} execTime Time command took to execute
	 * @param {external:Message} message Message that triggered the command
	 */

	/**
	 * Emitted whenever a user is blacklisted
	 * @memberof Bot
	 * @event event:blacklistAdd
	 * @param {User} user User who was blacklisted
	 * @param {boolean} global Whether or not blacklisting is global
	 */

	/**
	 * Emitted whenever a user is removed from the blacklist
	 * @memberof Bot
	 * @event event:blacklistRemove
	 * @param {User} user User who was removed
	 * @param {boolean} global Whether or not removal is global
	 */

	/**
	 * Emitted when the client is waiting for you to send a `finished` event,
	 * after which `clientReady` will be emitted
	 * @memberof Bot
	 * @event event:waiting
	 */

	/**
	 * To be emitted whenever you have finished setting things up that should
	 * be set up before the client is ready for use
	 * @memberof Bot
	 * @event event:finished
	 */

	/**
	 * Emitted when the client is ready. Should be used instead of Discord.js'
	 * `ready` event, as this is the point that everything is set up within the
	 * YAMDBF Client and it's all ready to go
	 * @memberof Bot
	 * @event event:clientReady
	 */
	public on(event: string, listener: Function): this
	{
		return super.on(event, listener);
	}
}
