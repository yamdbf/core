import 'reflect-metadata';
import * as Discord from 'discord.js';
import { Channel, ClientOptions, Collection, Guild, GuildMember, Message, MessageReaction, Role, User, Snowflake, GuildEmoji, RateLimitData, TextChannel, VoiceState, Presence, Speaking } from 'discord.js';
import { Command } from '../command/Command';
import { CommandRegistry } from '../command/CommandRegistry';
import { ResolverLoader } from '../command/resolvers/ResolverLoader';
import { RateLimitManager } from '../command/RateLimitManager';
import { ClientStorage } from '../storage/ClientStorage';
import { StorageProviderConstructor } from '../types/StorageProviderConstructor';
import { YAMDBFOptions } from '../types/YAMDBFOptions';
import { MiddlewareFunction } from '../types/MiddlewareFunction';
import { BaseCommandName } from '../types/BaseCommandName';
import { PluginLoader } from './PluginLoader';
import { ResolverConstructor } from '../types/ResolverConstructor';
/**
 * The YAMDBF Client through which you can access [storage]{@link Client#storage}
 * and any of the properties available on a typical Discord.js Client instance
 * @extends {external:Client}
 * @param {YAMDBFOptions} options Object containing required client properties
 * @param {external:ClientOptions} [clientOptions] Discord.js ClientOptions
 */
export declare class Client extends Discord.Client {
    private readonly _logger;
    private readonly _token;
    private readonly _plugins;
    private readonly _guildStorageLoader;
    private readonly _commandLoader;
    private readonly _dispatcher;
    private _ratelimit;
    readonly commandsDir: string | null;
    readonly localeDir: string | null;
    readonly owner: string[];
    readonly defaultLang: string;
    readonly statusText: string | null;
    readonly readyText: string;
    readonly unknownCommandError: boolean;
    readonly dmHelp: boolean;
    readonly passive: boolean;
    readonly pause: boolean;
    readonly disableBase: BaseCommandName[];
    readonly provider: StorageProviderConstructor;
    readonly plugins: PluginLoader;
    readonly storage: ClientStorage;
    readonly commands: CommandRegistry<this>;
    readonly rateLimitManager: RateLimitManager;
    readonly resolvers: ResolverLoader;
    readonly argsParser: (input: string, command?: Command, message?: Message) => string[];
    readonly buttons: {
        [key: string]: string;
    };
    readonly compact: boolean;
    readonly tsNode: boolean;
    readonly _middleware: MiddlewareFunction[];
    readonly _customResolvers: ResolverConstructor[];
    constructor(options: YAMDBFOptions, clientOptions?: ClientOptions);
    private __onReadyEvent;
    private __onContinueEvent;
    private __onGuildCreateEvent;
    private __onGuildDeleteEvent;
    /**
     * The global ratelimit for all command usage per user
     * @type {string}
     */
    ratelimit: string;
    /**
     * Starts the login process, culminating in the `clientReady` event
     * @returns {Client}
     */
    start(): this;
    /**
     * Shortcut method for `<Client>.emit('continue')`
     * @returns {void}
     */
    protected continue(): void;
    /**
     * Returns whether or not the given user is an owner
     * of the client/bot
     * @param {external:User} user User to check
     * @returns {boolean}
     */
    isOwner(user: User): boolean;
    /**
     * Set the value of a default setting key and push it to all guild
     * setting storages. Will not overwrite a setting in guild settings
     * storage if there is already an existing key with the given value
     * @param {string} key The key to use in settings storage
     * @param {any} value The value to use in settings storage
     * @returns {Promise<Client>}
     */
    setDefaultSetting(key: string, value: any): Promise<this>;
    /**
     * Remove a `defaultGuildSettings` item. Will not remove from any current
     * guild settings, but will remove the item from the defaults added to
     * new guild settings storages upon creation
     * @param {string} key The key to use in settings storage
     * @returns {Promise<Client>}
     */
    removeDefaultSetting(key: string): Promise<this>;
    /**
     * Check if a default guild setting exists
     * @param {string} key The default settings key to check for
     * @returns {Promise<boolean>}
     */
    defaultSettingExists(key: string): Promise<boolean>;
    /**
     * Shortcut to return the command prefix for the provided guild
     * @param {external:Guild} guild The Guild to get the prefix of
     * @returns {Promise<string | null>}
     */
    getPrefix(guild: Guild): Promise<string | null>;
    /**
     * Generate a bot invite URL based on the permissions included
     * in all of the commands the client currently has loaded.
     *
     * >**Note:** This should be run after `clientReady` to ensure
     * no command permissions are missing from the permissions set
     * that will be used to generate the URL
     * @returns {Promise<string>}
     */
    createBotInvite(): Promise<string>;
    /**
     * Clean out expired guild storage/settings
     * @returns {Promise<void>}
     */
    sweepStorages(): Promise<void>;
    /**
     * Adds a middleware function to be used when any command is called
     * to make modifications to args, determine if the command can
     * be run, or anything else you want to do every time any command
     * is called.
     *
     * See {@link MiddlewareFunction} for information on how a middleware
     * function should be represented
     *
     * Usage example:
     * ```
     * <Client>.use((message, args) => [message, args.map(a => a.toUpperCase())]);
     * ```
     * This will add a middleware function to all commands that will attempt
     * to transform all args to uppercase. This will of course fail if any
     * of the args are not a string.
     *
     * >**Note:** Middleware functions should only be added to the client one
     * time each and thus should not be added within any sort of event or loop.
     * Multiple separate middleware functions can be added to the via multiple
     * separate calls to this method
     *
     * >**Warning:** Do not use middleware for overriding the default argument
     * splitting. Use {@link YAMDBFOptions.argsParser} instead. Otherwise
     * you will see inconsistent results when using Command shortcuts, as
     * argument splitting for shortcut interpolation always happens before
     * middleware is run
     * @param {MiddlewareFunction} func The middleware function to use
     * @returns {Client}
     */
    use(func: MiddlewareFunction): this;
    /**
     * Reload custom commands. Used internally by the `reload` command
     * @private
     */
    _reloadCustomCommands(): number;
    on(event: 'channelCreate' | 'channelDelete', listener: (channel: Channel) => void): this;
    on(event: 'channelPinsUpdate', listener: (channel: Channel, time: Date) => void): this;
    on(event: 'channelUpdate', listener: (oldChannel: Channel, newChannel: Channel) => void): this;
    on(event: 'debug' | 'warn', listener: (info: string) => void): this;
    on(event: 'disconnect', listener: (event: any) => void): this;
    on(event: 'emojiCreate' | 'emojiDelete', listener: (emoji: GuildEmoji) => void): this;
    on(event: 'emojiUpdate', listener: (oldEmoji: GuildEmoji, newEmoji: GuildEmoji) => void): this;
    on(event: 'error', listener: (error: Error) => void): this;
    on(event: 'guildBanAdd' | 'guildBanRemove', listener: (guild: Guild, user: User) => void): this;
    on(event: 'guildCreate' | 'guildDelete' | 'guildUnavailable', listener: (guild: Guild) => void): this;
    on(event: 'guildMemberAdd' | 'guildMemberAvailable' | 'guildMemberRemove', listener: (member: GuildMember) => void): this;
    on(event: 'guildMembersChunk', listener: (members: Collection<Snowflake, GuildMember>, guild: Guild) => void): this;
    on(event: 'guildMemberSpeaking', listener: (member: GuildMember, speaking: Readonly<Speaking>) => void): this;
    on(event: 'guildMemberUpdate', listener: (oldMember: GuildMember, newMember: GuildMember) => void): this;
    on(event: 'guildUpdate', listener: (oldGuild: Guild, newGuild: Guild) => void): this;
    on(event: 'guildIntegrationsUpdate', listener: (guild: Guild) => void): this;
    on(event: 'message' | 'messageDelete' | 'messageReactionRemoveAll', listener: (message: Message) => void): this;
    on(event: 'messageDeleteBulk', listener: (messages: Collection<Snowflake, Message>) => void): this;
    on(event: 'messageReactionAdd' | 'messageReactionRemove', listener: (messageReaction: MessageReaction, user: User) => void): this;
    on(event: 'messageUpdate', listener: (oldMessage: Message, newMessage: Message) => void): this;
    on(event: 'presenceUpdate', listener: (oldPresence: Presence | undefined, newPresence: Presence) => void): this;
    on(event: 'rateLimit', listener: (rateLimitData: RateLimitData) => void): this;
    on(event: 'ready' | 'reconnecting', listener: () => void): this;
    on(event: 'resumed', listener: (replayed: number) => void): this;
    on(event: 'roleCreate' | 'roleDelete', listener: (role: Role) => void): this;
    on(event: 'roleUpdate', listener: (oldRole: Role, newRole: Role) => void): this;
    on(event: 'typingStart' | 'typingStop', listener: (channel: Channel, user: User) => void): this;
    on(event: 'userUpdate', listener: (oldUser: User, newUser: User) => void): this;
    on(event: 'voiceStateUpdate', listener: (oldState: VoiceState, newState: VoiceState) => void): this;
    on(event: 'webhookUpdate', listener: (channel: TextChannel) => void): this;
    on(event: string, listener: Function): this;
    on(event: 'command', listener: (name: string, args: any[], execTime: number, message: Message) => void): this;
    on(event: 'unknownCommand', listener: (name: string, args: any[], message: Message) => void): this;
    on(event: 'noCommand', listener: (message: Message) => void): this;
    on(event: 'blacklistAdd', listener: (user: User, global: boolean) => void): this;
    on(event: 'blacklistRemove', listener: (user: User, global: boolean) => void): this;
    on(event: 'pause', listener: () => void): this;
    on(event: 'continue', listener: () => void): this;
    on(event: 'clientReady', listener: () => void): this;
    once(event: 'channelCreate' | 'channelDelete', listener: (channel: Channel) => void): this;
    once(event: 'channelPinsUpdate', listener: (channel: Channel, time: Date) => void): this;
    once(event: 'channelUpdate', listener: (oldChannel: Channel, newChannel: Channel) => void): this;
    once(event: 'debug' | 'warn', listener: (info: string) => void): this;
    once(event: 'disconnect', listener: (event: any) => void): this;
    once(event: 'emojiCreate' | 'emojiDelete', listener: (emoji: GuildEmoji) => void): this;
    once(event: 'emojiUpdate', listener: (oldEmoji: GuildEmoji, newEmoji: GuildEmoji) => void): this;
    once(event: 'error', listener: (error: Error) => void): this;
    once(event: 'guildBanAdd' | 'guildBanRemove', listener: (guild: Guild, user: User) => void): this;
    once(event: 'guildCreate' | 'guildDelete' | 'guildUnavailable', listener: (guild: Guild) => void): this;
    once(event: 'guildMemberAdd' | 'guildMemberAvailable' | 'guildMemberRemove', listener: (member: GuildMember) => void): this;
    once(event: 'guildMembersChunk', listener: (members: Collection<Snowflake, GuildMember>, guild: Guild) => void): this;
    once(event: 'guildMemberSpeaking', listener: (member: GuildMember, speaking: Readonly<Speaking>) => void): this;
    once(event: 'guildMemberUpdate', listener: (oldMember: GuildMember, newMember: GuildMember) => void): this;
    once(event: 'guildUpdate', listener: (oldGuild: Guild, newGuild: Guild) => void): this;
    once(event: 'guildIntegrationsUpdate', listener: (guild: Guild) => void): this;
    once(event: 'message' | 'messageDelete' | 'messageReactionRemoveAll', listener: (message: Message) => void): this;
    once(event: 'messageDeleteBulk', listener: (messages: Collection<Snowflake, Message>) => void): this;
    once(event: 'messageReactionAdd' | 'messageReactionRemove', listener: (messageReaction: MessageReaction, user: User) => void): this;
    once(event: 'messageUpdate', listener: (oldMessage: Message, newMessage: Message) => void): this;
    once(event: 'presenceUpdate', listener: (oldPresence: Presence | undefined, newPresence: Presence) => void): this;
    once(event: 'rateLimit', listener: (rateLimitData: RateLimitData) => void): this;
    once(event: 'ready' | 'reconnecting', listener: () => void): this;
    once(event: 'resumed', listener: (replayed: number) => void): this;
    once(event: 'roleCreate' | 'roleDelete', listener: (role: Role) => void): this;
    once(event: 'roleUpdate', listener: (oldRole: Role, newRole: Role) => void): this;
    once(event: 'typingStart' | 'typingStop', listener: (channel: Channel, user: User) => void): this;
    once(event: 'userUpdate', listener: (oldUser: User, newUser: User) => void): this;
    once(event: 'voiceStateUpdate', listener: (oldState: VoiceState, newState: VoiceState) => void): this;
    once(event: 'webhookUpdate', listener: (channel: TextChannel) => void): this;
    once(event: string, listener: Function): this;
    once(event: 'command', listener: (name: string, args: any[], execTime: number, message: Message) => void): this;
    once(event: 'unknownCommand', listener: (name: string, args: any[], message: Message) => void): this;
    once(event: 'noCommand', listener: (message: Message) => void): this;
    once(event: 'blacklistAdd', listener: (user: User, global: boolean) => void): this;
    once(event: 'blacklistRemove', listener: (user: User, global: boolean) => void): this;
    once(event: 'pause', listener: () => void): this;
    once(event: 'continue', listener: () => void): this;
    once(event: 'clientReady', listener: () => void): this;
}
