import { PermissionResolvable, Message } from 'discord.js';
import { Client } from '../client/Client';
import { MiddlewareFunction } from '../types/MiddlewareFunction';
import { CommandInfo } from '../types/CommandInfo';
import { RateLimiter } from './RateLimiter';
import { ArgOpts } from '../types/ArgOpts';

/**
 * Command class to extend to create commands users can execute
 * @param {Client} client - YAMDBF Client instance
 * @param {CommandInfo} info - Object containing required command properties
 */
export class Command<T extends Client>
{
	public readonly client: T;
	public name: string;
	public description: string;
	public usage: string;
	public extraHelp: string;
	public group: string;
	public aliases: string[];
	public guildOnly: boolean;
	public hidden: boolean;
	public argOpts: ArgOpts;
	public permissions: PermissionResolvable[];
	public roles: string[];
	public ownerOnly: boolean;
	public overloads: string;

	public _classloc: string;
	public readonly _rateLimiter: RateLimiter;
	public readonly _middleware: MiddlewareFunction[];

	public constructor(client: T, info: CommandInfo = null)
	{
		/**
		 * YAMDBF Client instance
		 * @type {Client}
		 */
		this.client = client;

		/**
		 * The name of the command, used by the dispatcher
		 * to determine the command being executed
		 * @name Command#name
		 * @type {string}
		 */

		/**
		 * A brief description of the command, displayed
		 * in the commands list via the Help command
		 * @name Command#description
		 * @type {string}
		 */

		/**
		 * An example of command usage. The token `<prefix>` will
		 * be replaced by the guild-specific command prefix in the Help command when
		 * `help <command>` is called
		 * @name Command#usage
		 * @type {string}
		 */

		/**
		 * Extra information about the command to be displayed
		 * by the Help command when `help <command>` is called
		 * @name Command#extraHelp
		 * @type {string}
		 */

		/**
		 * The command group that the command belongs to. Allows commands to be
		 * grouped for disabling. The group 'base' cannot be disabled.
		 * @name Command#group
		 * @type {string}
		 */

		/**
		 * Aliases the command can be called by other than its name
		 * @name Command#aliases
		 * @type {string[]}
		 */

		/**
		 * Whether or not a command can only be used within a
		 * guild text channel
		 * @name Command#guildOnly
		 * @type {boolean}
		 */

		/**
		 * Whether or not the command is to be hidden from the
		 * commands list via the default help command
		 * @name Command#hidden
		 * @type {boolean}
		 */

		/**
		 * Options for how arguments should be parsed.<br>
		 * **See:** {@link ArgOpts}
		 * @name Command#argOpts
		 * @type {ArgOpts}
		 */

		/**
		 * Array of permissions required by the command
		 * caller to be able to execute the command in the guild the command is called in.
		 *
		 * If any permissions are provided the command's `guildOnly` property will be automatically set to true
		 * @name Command#permissions
		 * @type {external:PermissionResolvable[]}
		 */

		/**
		 * Array of roles required to use the command. If the command caller
		 * has any of the roles in the array, they will be able to use the command
		 *
		 * If any roles are provided the command's `guildOnly` property will be automatically set to true
		 * @name Command#roles
		 * @type {string[]}
		 */

		/**
		 * Whether or not the command can be used only by the client/bot owner(s).<br>
		 * **See:** [Client#config.owner]{@link Client#config}
		 * @name Command#ownerOnly
		 * @type {boolean}
		 */

		/**
		 * The name of a base command to overload. Commands may only overload
		 * base commands so the {@link Command#group} must be set to 'base' in
		 * order to overload. Commands may only be overloaded by name, not by alias
		 * @name Command#overloads
		 * @type {string}
		 */

		// Middleware function storage for the Command instance
		this._middleware = [];

		if (info) Object.assign(this, info);

		// Create the RateLimiter instance if a ratelimit is specified
		if (info && info.ratelimit)
			this._rateLimiter = new RateLimiter(info.ratelimit, false);
	}

	/**
	 * Action to be executed when the command is called. The following parameters
	 * are what command actions will be passed by the {@link CommandDispatcher} whenever
	 * a command is called. Be sure to receive these in proper order when writing
	 * new commands
	 * @param {external:Message} message Discord.js message object
	 * @param {any[]} args An array containing the args parsed from the command calling message.<br>
	 * 					   Will contain strings unless middleware is used to transform the args
	 * @returns {any}
	 */
	public action(message: Message, args: any[]): void
	{
		throw new Error(`${this.constructor.name} has not overloaded the command action method`);
	}

	/**
	 * Assert {@link Command#action} is typeof Function, finishing the
	 * command creation process.<br>Called by {@link CommandRegistry#register}
	 * @returns {void}
	 */
	public register(): void
	{
		const name: string = this.constructor.name;

		// Set defaults if not present
		if (!this.aliases) this.aliases = [];
		if (!this.group) this.group = 'base';
		if (!this.guildOnly) this.guildOnly = false;
		if (!this.hidden) this.hidden = false;
		if (!this.argOpts) this.argOpts = {};
		if (!this.argOpts.separator) this.argOpts.separator = ' ';
		if (!this.permissions) this.permissions = [];
		if (!this.roles) this.roles = [];
		if (!this.ownerOnly) this.ownerOnly = false;

		// Make necessary asserts
		if (!this.name) throw new Error(`You must provide a name for command: ${name}`);
		if (!this.description) throw new Error(`You must provide a description for command: ${name}`);
		if (!this.usage) throw new Error(`You must provide usage information for command: ${name}`);
		if (!this.group) throw new Error(`You must provide a group for command: ${name}`);
		if (this.aliases && !Array.isArray(this.aliases)) throw new Error(`Aliases for command ${name} must be an array`);
		if (this.permissions && !Array.isArray(this.permissions)) throw new Error(`Permissions for command ${name} must be an array`);
		if (this.permissions && this.permissions.length > 0)
			for (const [index, perm] of this.permissions.entries())
			{
				try
				{
					Permissions.resolve(perm);
				}
				catch (err)
				{
					throw new Error(`Command#${name} permission "${this.permissions[index]}" at ${name}.permissions[${index}] is not a valid permission.\n\n${err}`);
				}
			}
		if (this.roles && !Array.isArray(this.roles)) throw new Error(`Roles for command ${name} must be an array`);
		if (this.overloads && this.group !== 'base') throw new Error('Commands may only overload commands in group "base"');

		// Default guildOnly to true if permissions/roles are given
		if (this.permissions.length > 0 || this.roles.length > 0) this.guildOnly = true;

		if (!this.action) throw new Error(`Command#${name}.action: expected Function, got: ${typeof this.action}`);
		if (!(this.action instanceof Function)) throw new Error(`Command#${name}.action: expected Function, got: ${typeof this.action}`);
	}

	/**
	 * Adds a middleware function to be used when the command is called
	 * to make modifications to args, determine if the command can
	 * be run, or anything else you want to do whenever this command
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
	 * This will add a middleware function to the command that will attempt
	 * to transform all args to uppercase. This will of course fail if any
	 * of the args are not a string.
	 *
	 * Note: Middleware functions should only be added to a command one time each,
	 * and thus should be added in the Command's constructor. Multiple middleware
	 * functions can be added to a command via multiple calls to this method
	 * @param {MiddlewareFunction} func Middleware function. `(message, args) => [message, args]`
	 * @returns {Command} This command instance
	 */
	public use(func: MiddlewareFunction): this
	{
		this._middleware.push(func);
		return this;
	}

	/**
	 * Send provided response text to the command's calling channel
	 * via edit, editCode, send, or sendCode depending on whether
	 * or not the client is a selfbot and/or a codeblock language is given
	 * @protected
	 * @param {external:Message} message Discord.js Message object
	 * @param {string} response String to send
	 * @param {string} [code] Language to use if sendCode/editCode effect is desired
	 * @returns {Promise<external:Message | external:Message[]>}
	 */
	protected respond(message: Message, response: string, code?: string): Promise<Message | Message[]>
	{
		if (this.client.selfbot && !code) return message.edit(response);
		if (this.client.selfbot && code) return message.editCode(code, response);
		if (code) return message.channel.sendCode(code, response);
		return message.channel.sendMessage(response);
	}
}
