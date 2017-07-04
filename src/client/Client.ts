import 'reflect-metadata';
import * as Discord from 'discord.js';
import * as path from 'path';

import {
	Channel,
	ClientOptions,
	Collection,
	Emoji,
	Guild,
	GuildMember,
	Message,
	MessageReaction,
	Role,
	User,
	UserResolvable,
	ClientUserSettings,
	Snowflake
} from 'discord.js';

import { Command } from '../command/Command';
import { CommandDispatcher } from '../command/CommandDispatcher';
import { CommandLoader } from '../command/CommandLoader';
import { CommandRegistry } from '../command/CommandRegistry';
import { RateLimiter } from '../command/RateLimiter';
import { GuildStorageLoader } from '../storage/GuildStorageLoader';
import { JSONProvider } from '../storage/JSONProvider';
import { StorageProvider } from '../storage/StorageProvider';
import { StorageFactory } from '../storage/StorageFactory';
import { YAMDBFOptions } from '../types/YAMDBFOptions';
import { ClientStorage } from '../types/ClientStorage';
import { MiddlewareFunction } from '../types/MiddlewareFunction';
import { StorageProviderConstructor } from '../types/StorageProviderConstructor';
import { BaseCommandName } from '../types/BaseCommandName';
import { Logger, logger } from '../util/logger/Logger';
import { ListenerUtil } from '../util/ListenerUtil';
import { Lang } from '../localization/Lang';

const { on, once, registerListeners } = ListenerUtil;

/**
 * The YAMDBF Client through which you can access [storage]{@link Client#storage}
 * and any of the properties available on a typical Discord.js Client instance
 * @extends {external:Client}
 * @param {YAMDBFOptions} options Object containing required client properties
 * @param {external:ClientOptions} [clientOptions] Discord.js ClientOptions
 */
export class Client extends Discord.Client
{
	@logger private readonly _logger: Logger;
	public readonly name: string;
	public readonly commandsDir: string;
	public readonly localeDir: string;
	public readonly owner: string[];
	public readonly defaultLang: string;
	public readonly statusText: string;
	public readonly readyText: string;
	public readonly unknownCommandError: boolean;
	public readonly selfbot: boolean;
	public readonly passive: boolean;
	public readonly pause: boolean;
	public readonly version: string;
	public readonly disableBase: BaseCommandName[];
	public readonly provider: StorageProviderConstructor;
	public readonly _middleware: MiddlewareFunction[];
	public readonly _rateLimiter: RateLimiter;

	public readonly storage: ClientStorage;
	public readonly commands: CommandRegistry<this, string, Command<this>>;

	private readonly _token: string;
	private readonly _storageFactory: StorageFactory;
	private readonly _guildDataStorage: StorageProvider;
	private readonly _guildSettingStorage: StorageProvider;
	private readonly _guildStorageLoader: GuildStorageLoader<this>;
	private readonly _commandLoader: CommandLoader<this>;
	private readonly _dispatcher: CommandDispatcher<this>;

	public constructor(options: YAMDBFOptions, clientOptions?: ClientOptions)
	{
		super(clientOptions);
		Reflect.defineMetadata('YAMDBFClient', true, this);

		this._token = options.token;

		/**
		 * The name of the bot this Client is for
		 * @type {string}
		 */
		this.name = options.name || 'botname';

		/**
		 * The owner/owners of the bot, represented as an array of IDs.
		 * These IDs determine who is allowed to use commands flagged as
		 * `ownerOnly`
		 * @type {string[]}
		 */
		this.owner = options.owner instanceof Array ?
			options.owner : typeof options.owner !== 'undefined' ?
				[options.owner] : [];

		/**
		 * Directory to find command class files. Optional
		 * if client is passive.<br>
		 * **See:** {@link Client#passive}
		 * @type {string}
		 */
		this.commandsDir = options.commandsDir ? path.resolve(options.commandsDir) : null;

		/**
		 * Directory to find custom localization files
		 */
		this.localeDir = options.localeDir ? path.resolve(options.localeDir) : null;

		/**
		 * Default language to use for localization
		 * @type {string}
		 */
		this.defaultLang = options.defaultLang || 'en_us';

		/**
		 * Status text for the client
		 * @type {string}
		 */
		this.statusText = options.statusText || null;

		/**
		 * Text to output when the client is ready
		 * @type {string}
		 */
		this.readyText = options.readyText || 'Client ready!';

		/**
		 * Whether or not a generic 'command not found' message
		 * should be given in DMs to instruct the user to
		 * use the `help` command. `true` by default
		 * @type {string}
		 */
		this.unknownCommandError = options.unknownCommandError === undefined ?
			true : options.unknownCommandError;

		/**
		 * Whether or not the client is a selfbot
		 * @type {boolean}
		 */
		this.selfbot = options.selfbot || false;

		/**
		 * Whether or not this client is passive. Passive clients
		 * will not register a command dispatcher or a message
		 * listener. This allows passive clients to be created that
		 * do not respond to any commands but are able to perform
		 * actions based on whatever the framework user wants
		 * @type {boolean}
		 */
		this.passive = options.passive || false;

		/**
		 * Whether or not the client will pause after loading Client
		 * Storage, giving the opportunity to add/change default
		 * settings before guild settings are created for the first
		 * time. If this is used, you must create a listener for `'pause'`,
		 * and emit `'continue'` when you have finished doing what you
		 * need to do.
		 *
		 * If adding new default settings is desired *after* guild settings
		 * have already been generated for the first time, they should be
		 * added after `'clientReady'` so they can be properly pushed to
		 * the settings for all guilds
		 * @type {boolean}
		 */
		this.pause = options.pause || false;

		/**
		 * Client version, best taken from package.json
		 * @type {string}
		 */
		this.version = options.version || '0.0.0';

		/**
		 * Array of base command names to skip when loading commands. Base commands
		 * may only be disabled by name, not by alias
		 * @type {BaseCommandName[]}
		 */
		this.disableBase = options.disableBase || [];

		// Create the global RateLimiter instance if a ratelimit is specified
		if (options.ratelimit)
			this._rateLimiter = new RateLimiter(options.ratelimit, true);

		// Set the logger level if provided
		if (typeof options.logLevel !== 'undefined')
			this._logger.setLogLevel(options.logLevel);

		// Middleware function storage for the client instance
		this._middleware = [];

		/**
		 * The chosen storage provider to use for the Client.
		 * Defaults to {@link JSONProvider}
		 * @type {StorageProvider}
		 */
		this.provider = options.provider || JSONProvider;

		this._guildDataStorage = new this.provider('guild_storage');
		this._guildSettingStorage = new this.provider('guild_settings');
		this._storageFactory = new StorageFactory(this, this._guildDataStorage, this._guildSettingStorage);
		this._guildStorageLoader = new GuildStorageLoader(this, this._storageFactory);

		/**
		 * Client-specific storage. Also contains a `guilds` Collection property containing
		 * all GuildStorage instances
		 * @type {ClientStorage}
		 */
		this.storage = this._storageFactory.createClientStorage();

		/**
		 * [Collection]{@link external:Collection} containing all loaded commands
		 * @type {CommandRegistry<string, Command>}
		 */
		this.commands = new CommandRegistry<this, string, Command<this>>();

		this._commandLoader = !this.passive ? new CommandLoader(this) : null;
		this._dispatcher = !this.passive ? new CommandDispatcher<this>(this) : null;

		Lang.createInstance(this);
		Lang.loadLocalizations();

		if (!this.passive)
		{
			// Disable setlang command if there is only one language
			if (Lang.langNames.length === 1)
				this.disableBase.push('setlang');

			this.loadCommand('all');
			Lang.loadCommandLocalizations();
		}

		registerListeners(this);
	}

//#region Event handlers

	@once('ready')
	private async __onReadyEvent(): Promise<void>
	{
		await this.storage.init();

		// Load defaultGuildSettings into storage the first time the client is run
		if (typeof await this.storage.get('defaultGuildSettings') === 'undefined')
			await this.storage.set('defaultGuildSettings',
				require('../storage/defaultGuildSettings.json'));

		if (this.pause) this.emit('pause');
		else this.__onContinueEvent();

		this.user.setGame(this.statusText);
	}

	@once('continue')
	private async __onContinueEvent(): Promise<void>
	{
		await this._guildDataStorage.init();
		await this._guildSettingStorage.init();

		await this._guildStorageLoader.loadStorages(this._guildDataStorage, this._guildSettingStorage);

		this._logger.log('Client', this.readyText);
		if (!this.passive) this._dispatcher.setReady();
		this.emit('clientReady');
	}

	@on('guildCreate')
	private __onGuildCreateEvent(): void
	{
		this._guildStorageLoader.initNewGuilds(this._guildDataStorage, this._guildSettingStorage);
	}

	@on('guildDelete')
	private __onGuildDeleteEvent(guild: Guild): void
	{
		this.storage.guilds.delete(guild.id);
		this._guildDataStorage.remove(guild.id);
		this._guildSettingStorage.remove(guild.id);
	}

//#endregion

	/**
	 * Starts the login process, culminating in the `clientReady` event
	 * @returns {Client}
	 */
	public start(): this
	{
		if (!this._token) throw new Error('Client cannot be started without being given a token.');
		this.login(this._token);
		return this;
	}

	/**
	 * Shortcut method for `<Client>.emit('continue')`
	 * @returns {void}
	 */
	protected continue(): void
	{
		this.emit('continue');
	}

	/**
	 * Loads/reloads all/specific commands
	 * @param {string} command The name of a command to reload, or 'all' to load all commands
	 * @returns {void}
	 */
	public loadCommand(command: string): void
	{
		if (!command) throw new Error(`A command name must be provided to load, or 'all' to load all commands`);
		if (command === 'all') this._commandLoader.loadCommands();
		else this._commandLoader.reloadCommand(command);
	}

	/**
	 * Returns whether or not the given user is an owner
	 * of the client/bot
	 * @param {external:User} user User to check
	 * @returns {boolean}
	 */
	public isOwner(user: User): boolean
	{
		return this.owner.includes(user.id);
	}

	/**
	 * Set the value of a default setting key and push it to all guild
	 * setting storages. Will not overwrite a setting in guild settings
	 * storage if there is already an existing key with the given value
	 * @param {string} key The key to use in settings storage
	 * @param {any} value The value to use in settings storage
	 * @returns {Promise<Client>}
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
	 * Remove a `defaultGuildSettings` item. Will not remove from any current
	 * guild settings, but will remove the item from the defaults added to
	 * new guild settings storages upon creation
	 * @param {string} key The key to use in settings storage
	 * @returns {Promise<Client>}
	 */
	public async removeDefaultSetting(key: string): Promise<this>
	{
		await this.storage.remove(`defaultGuildSettings.${key}`);
		return this;
	}

	/**
	 * Check if a default guild setting exists
	 * @param {string} key The default settings key to check for
	 * @returns {Promise<boolean>}
	 */
	public async defaultSettingExists(key: string): Promise<boolean>
	{
		return typeof await this.storage.get(`defaultGuildSettings.${key}`) !== 'undefined';
	}

	/**
	 * Shortcut to return the command prefix for the provided guild
	 * @param {external:Guild} guild The Guild to get the prefix of
	 * @returns {Promise<string | null>}
	 */
	public async getPrefix(guild: Guild): Promise<string>
	{
		if (!guild) return null;
		return (await this.storage.guilds.get(guild.id).settings.get('prefix')) || null;
	}

	/**
	 * Clean out any guild storage/settings that no longer have
	 * an associated guild
	 * @returns {void}
	 */
	public sweepStorages(): void
	{
		this._guildStorageLoader.cleanGuilds(this._guildDataStorage, this._guildSettingStorage);
	}

	/**
	 * Adds a middleware function to be used when any command is called
	 * to make modifications to args, determine if the command can
	 * be run, or anything else you want to do every time any command
	 * is called. Takes a function that will receive the message object
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
	 * Note: Middleware functions should only be added to the client one time each,
	 * and thus should not be added within any sort of event or loop.
	 * Multiple middleware functions can be added to the via multiple calls
	 * to this method
	 * @param {MiddlewareFunction} func Middleware function. `(message, args) => [message, args]`
	 * @returns {Client}
	 */
	public use(func: MiddlewareFunction): this
	{
		this._middleware.push(func);
		return this;
	}

//#region Discord.js events

	public on(event: 'channelCreate', listener: (channel: Channel) => void): this;
	public on(event: 'channelDelete', listener: (channel: Channel) => void): this;
	public on(event: 'channelPinsUpdate', listener: (channel: Channel, time: Date) => void): this;
	public on(event: 'channelUpdate', listener: (oldChannel: Channel, newChannel: Channel) => void): this;
	public on(event: 'clientUserSettingsUpdate', listener: (clientUserSettings: ClientUserSettings) => void): this;
	public on(event: 'debug', listener: (info: string) => void): this;
	public on(event: 'disconnect', listener: (event: any) => void): this;
	public on(event: 'emojiCreate', listener: (emoji: Emoji) => void): this;
	public on(event: 'emojiDelete', listener: (emoji: Emoji) => void): this;
	public on(event: 'emojiUpdate', listener: (oldEmoji: Emoji, newEmoji: Emoji) => void): this;
	public on(event: 'error', listener: (error: Error) => void): this;
	public on(event: 'guildBanAdd', listener: (guild: Guild, user: User) => void): this;
	public on(event: 'guildBanRemove', listener: (guild: Guild, user: User) => void): this;
	public on(event: 'guildCreate', listener: (guild: Guild) => void): this;
	public on(event: 'guildDelete', listener: (guild: Guild) => void): this;
	public on(event: 'guildMemberAdd', listener: (member: GuildMember) => void): this;
	public on(event: 'guildMemberAvailable', listener: (member: GuildMember) => void): this;
	public on(event: 'guildMemberRemove', listener: (member: GuildMember) => void): this;
	public on(event: 'guildMembersChunk', listener: (members: Collection<Snowflake, GuildMember>, guild: Guild) => void): this;
	public on(event: 'guildMemberSpeaking', listener: (member: GuildMember, speaking: boolean) => void): this;
	public on(event: 'guildMemberUpdate', listener: (oldMember: GuildMember, newMember: GuildMember) => void): this;
	public on(event: 'guildUnavailable', listener: (guild: Guild) => void): this;
	public on(event: 'guildUpdate', listener: (oldGuild: Guild, newGuild: Guild) => void): this;
	public on(event: 'message', listener: (message: Message) => void): this;
	public on(event: 'messageDelete', listener: (message: Message) => void): this;
	public on(event: 'messageDeleteBulk', listener: (messages: Collection<Snowflake, Message>) => void): this;
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
	public on(event: 'pause', listener: () => void): this;
	public on(event: 'continue', listener: () => void): this;
	public on(event: 'clientReady', listener: () => void): this;

	/**
	 * Emitted whenever a command is successfully called
	 * @memberof Client
	 * @event event:command
	 * @param {string} name Name of the called command
	 * @param {any[]} args Args passed to the called command
	 * @param {number} execTime Time command took to execute
	 * @param {external:Message} message Message that triggered the command
	 */

	/**
	 * Emitted whenever a user is blacklisted
	 * @memberof Client
	 * @event event:blacklistAdd
	 * @param {User} user User who was blacklisted
	 * @param {boolean} global Whether or not blacklisting is global
	 */

	/**
	 * Emitted whenever a user is removed from the blacklist
	 * @memberof Client
	 * @event event:blacklistRemove
	 * @param {User} user User who was removed
	 * @param {boolean} global Whether or not removal is global
	 */

	/**
	 * Emitted when the client is waiting for you to send a `continue` event,
	 * after which `clientReady` will be emitted
	 * @memberof Client
	 * @event event:pause
	 */

	/**
	 * To be emitted after the `pause` event when you have finished setting
	 * things up that should be set up before the client is ready for use
	 * @memberof Client
	 * @event event:continue
	 */

	/**
	 * Emitted when the client is ready. Should be used instead of Discord.js'
	 * `ready` event, as this is the point that everything is set up within the
	 * YAMDBF Client and it's all ready to go
	 * @memberof Client
	 * @event event:clientReady
	 */
	public on(event: string, listener: Function): this
	{
		return super.on(event, listener);
	}
}
