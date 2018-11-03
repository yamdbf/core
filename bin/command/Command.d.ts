import { PermissionResolvable, MessageOptions } from 'discord.js';
import { Client } from '../client/Client';
import { MiddlewareFunction } from '../types/MiddlewareFunction';
import { CommandInfo } from '../types/CommandInfo';
import { ArgOpts } from '../types/ArgOpts';
import { Message } from '../types/Message';
import { RespondOptions } from '../types/RespondOptions';
import { CommandLock } from './CommandLock';
/**
 * Action to be executed when the command is called. The following parameters
 * are what command actions will be passed by the {@link CommandDispatcher} whenever
 * a command is called. Be sure to receive these in proper order when writing
 * new commands
 * @abstract
 * @method Command#action
 * @param {external:Message} message Discord.js message object
 * @param {any[]} args An array containing the args parsed from the command calling message.<br>
 * 					   Will contain strings unless middleware is used to transform the args
 * @returns {any}
 */
/**
 * Command class to extend to create commands users can execute
 * @abstract
 * @param {CommandInfo} info - Object containing required command properties
 */
export declare abstract class Command<T extends Client = Client> {
    private _disabled;
    private _ratelimit;
    client: T;
    name: string;
    desc: string;
    usage: string;
    info: string;
    group: string;
    aliases: string[];
    guildOnly: boolean;
    hidden: boolean;
    argOpts: ArgOpts;
    callerPermissions: PermissionResolvable[];
    clientPermissions: PermissionResolvable[];
    roles: string[];
    ownerOnly: boolean;
    external: boolean;
    lock: CommandLock;
    lockTimeout: number;
    readonly _middleware: MiddlewareFunction[];
    _classloc: string;
    _initialized: boolean;
    constructor(info?: CommandInfo);
    abstract action(message: Message, args: any[]): any;
    /**
     * The ratelimit for this command per user
     * @type {string}
     */
    ratelimit: string;
    /**
     * Can be included in a command to initlialize any resources a command
     * needs at runtime that require things that are not available within
     * a command's constructor like the client instance or client/guild storages.
     *
     * Will be called after all commands are loaded (including those from
     * any loaded plugins) and after all base framework storages (client and guild)
     * are ready for use.
     *
     * >**Note:** Can be async if needed
     * @abstract
     * @returns {Promise<void>}
     */
    init(): void;
    /**
     * Make necessary asserts for Command validity.
     * Called internally by the command loader
     * @private
     */
    _register(client: T): void;
    /**
     * Whether or not this command is disabled
     * @type {boolean}
     */
    readonly disabled: boolean;
    /**
     * Enable this command if it is disabled
     * @returns {void}
     */
    enable(): void;
    /**
     * Disable this command if it is enabled
     * @returns {void}
     */
    disable(): void;
    /**
     * Adds a middleware function to be used when the command is called
     * to make modifications to args, determine if the command can
     * be run, or anything else you want to do whenever this command
     * is called.
     *
     * See {@link MiddlewareFunction} for information on how a middleware
     * function should be represented
     *
     * Usage example:
     * ```
     * <Client>.use((message, args) => [message, args.map(a => a.toUpperCase())]);
     * ```
     * This will add a middleware function to this command that will attempt
     * to transform all args to uppercase. This will of course fail if any
     * of the args are not a string.
     *
     * >**Note:** Middleware functions should only be added to a command one
     * time each and thus should not be added within any sort of event or loop.
     * Multiple separate middleware functions can be added to the via multiple
     * separate calls to this method
     * @param {MiddlewareFunction} func The middleware function to use
     * @returns {Command}
     */
    use(func: MiddlewareFunction): this;
    protected respond(message: Message, response: string, options?: MessageOptions): Promise<Message | Message[]>;
    protected respond(message: Message, response: string, options?: RespondOptions): Promise<void>;
    /**
     * Validate PermissionResolvables in the given array, throwing an error
     * for any that are invalid
     * @private
     */
    private _validatePermissions;
}
