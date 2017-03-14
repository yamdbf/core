import { PermissionResolvable, Message } from 'discord.js';
import { Bot } from '../bot/Bot';
import { MiddlewareFunction } from '../types/MiddlewareFunction';
import { CommandInfo } from '../types/CommandInfo';
import { ArgOpts } from '../types/ArgOpts';

/**
 * Command class to extend to create commands users can execute
 * @class Command
 * @param {Bot} bot - Bot instance
 * @param {CommandInfo} info - Object containing required command properties
 */
export class Command<T extends Bot>
{
	public bot: T;
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
	public _middleware: MiddlewareFunction[];

	public constructor(bot: T, info: CommandInfo = null)
	{
		// Assert necessary command information
		const name: string = this.constructor.name;
		if (!info) throw new Error(`You must provide an info object for command: ${name}`);
		if (!info.name) throw new Error(`You must provide a name for command: ${name}`);
		if (!info.description) throw new Error(`You must provide a description for command: ${name}`);
		if (!info.usage) throw new Error(`You must provide usage information for command: ${name}`);
		if (!info.group) throw new Error(`You must provide a group for command: ${name}`);
		if (info.aliases && !Array.isArray(info.aliases)) throw new Error(`Aliases for command ${name} must be an array`);
		if (info.permissions && !Array.isArray(info.permissions)) throw new Error(`Permissions for command ${name} must be an array`);
		if (info.permissions && info.permissions.length > 0)
			info.permissions.forEach((perm: PermissionResolvable, index: number) =>
			{
				try
				{
					(<any> bot).resolver.resolvePermission(perm);
				}
				catch (err)
				{
					throw new Error(`Command#${name} permission "${info.permissions[index]}" at ${name}.permissions[${index}] is not a valid permission.\n\n${err}`);
				}
			});
		if (info.roles && !Array.isArray(info.roles)) throw new Error(`Roles for command ${name} must be an array`);

		/**
		 * Bot instance
		 * @memberof Command
		 * @type {Bot}
		 * @name bot
		 * @instance
		 */
		this.bot = bot;

		/**
		 * The name of the command, used by the dispatcher
		 * to determine the command being executed
		 * @memberof Command
		 * @type {string}
		 * @name name
		 * @instance
		 */
		this.name = info.name;

		/**
		 * A brief description of the command, displayed
		 * in the commands list via the Help command
		 * @memberof Command
		 * @type {string}
		 * @name description
		 * @instance
		 */
		this.description = info.description;

		/**
		 * An example of command usage. The token '&lt;prefix&gt;' will
		 * be replaced by the guild-specific command prefix in the Help command when
		 * 'help &lt;command&gt;' is called
		 * @memberof Command
		 * @type {string}
		 * @name usage
		 * @instance
		 */
		this.usage = info.usage;

		/**
		 * Extra information about the command to be displayed
		 * by the Help command when 'help &lt;command&gt;' is called
		 * @memberof Command
		 * @type {string}
		 * @name extraHelp
		 * @instance
		 */
		this.extraHelp = info.extraHelp;

		/**
		 * The command group that the command belongs to. Allows commands to be
		 * grouped for disabling. The group 'base' cannot be disabled.
		 * @memberof Command
		 * @type {string}
		 * @name group
		 * @instance
		 */
		this.group = info.group;

		/**
		 * Aliases the command can be called by other than its name
		 * @memberof Command
		 * @type {string[]}
		 * @name aliases
		 * @instance
		 */
		this.aliases = info.aliases || [];

		/**
		 * Whether or not a command can only be used within a
		 * guild text channel
		 * @memberof Command
		 * @type {boolean}
		 * @name guildOnly
		 * @instance
		 */
		this.guildOnly = info.guildOnly || false;

		/**
		 * Whether or not the command is to be hidden from the
		 * commands list via the default help command
		 */
		this.hidden = info.hidden || false;

		/**
		 * Options for how arguments should be parsed. See: {@link ArgOpts}
		 * @memberof Command
		 * @type {ArgOpts}
		 * @name argOpts
		 * @instance
		 */
		this.argOpts = info.argOpts || {};
		this.argOpts.separator = this.argOpts.separator || ' ';

		/**
		 * Array of permissions required by the command
		 * caller to be able to execute the command in the guild the command is called in.
		 * <br><br>
		 * If any permissions are provided the command's `guildOnly` property will be automatically set to true
		 * @memberof Command
		 * @type {external:PermissionResolvable[]}
		 * @name permissions
		 * @instance
		 */
		this.permissions = info.permissions || [];

		/**
		 * Array of roles required to use the command. If the command caller
		 * has any of the roles in the array, they will be able to use the command
		 * <br><br>
		 * If any roles are provided the command's `guildOnly` property will be automatically set to true
		 * @memberof Command
		 * @type {string[]}
		 * @name roles
		 * @instance
		 */
		this.roles = info.roles || [];

		/**
		 * Whether or not the command can be used by the bot owner(s).
		 * @memberof Command
		 * @type {boolean}
		 * @name ownerOnly
		 * @instance
		 * @see [Bot#config.owner]{@link Bot#config}
		 */
		this.ownerOnly = info.ownerOnly || false;

		/**
		 * The name of a base command to overload. Commands may only overload
		 * base commands so the {@link Command#group} must be set to 'base' in
		 * order to overload. Commands may only be overloaded by name, not by alias
		 * @memberof Command
		 * @type {string}
		 * @name overloads
		 * @instance
		 */
		this.overloads = info.overloads || null;

		// Middleware function storage for the Command instance
		this._middleware = [];

		if (this.overloads && this.group !== 'base') throw new Error('Commands may only overload commands in group "base"');

		// Default guildOnly to true if permissions/roles are given
		if (this.permissions.length > 0 || this.roles.length > 0) this.guildOnly = true;
	}

	/**
	 * Action to be executed when the command is called. The following parameters
	 * are what command actions will be passed by the {@link CommandDispatcher} whenever
	 * a command is called. Be sure to receive these in proper order when writing
	 * new commands
	 * @memberof Command
	 * @instance
	 * @param {external:Message} message Discord.js message object
	 * @param {any[]} args An array containing the args parsed from the command calling message.<br>
	 * 					   Will contain strings unless middleware is used to transform the args
	 */
	public action(message: Message, args: any[]): void
	{
		throw new Error(`${this.constructor.name} has not overloaded the command action method`);
	}

	/**
	 * Assert {@link Command#action} is typeof Function, finishing the
	 * command creation process.<br>Called by {@link CommandRegistry#register}
	 * @memberof Command
	 * @instance
	 */
	public register(): void
	{
		let name: string = this.constructor.name;
		if (!this.action) throw new Error(`Command#${name}.action: expected Function, got: ${typeof this.action}`);
		if (!(this.action instanceof Function)) throw new Error(`Command#${name}.action: expected Function, got: ${typeof this.action}`);
	}

	/**
	 * Adds a middleware function to be used when the command is run
	 * to make modifications to args or determine if the command can
	 * be run. Takes a function that will receive the message object
	 * and the array of args.<br><br>
	 *
	 * A middleware function must return an array where the first item
	 * is the message object and the second item is the args array.
	 * If a middleware function returns a string, or throws a string/error,
	 * it will be sent to the calling channel as a message and the command
	 * execution will be aborted. If a middleware function does not return
	 * anything or returns something other than an array or string, it will
	 * fail silently.<br><br>
	 *
	 * Example:<br>
	 * <pre class="prettyprint"><code>this.use((message, args) => [message, args.map(a => a.toUpperCase())]);
	 * </code></pre><br>
	 * This will add a middleware function to the command that will attempt
	 * to transform all args to uppercase. This will of course fail if any
	 * of the args are not a string.<br><br>
	 *
	 * Note: Middleware functions should only be added to a command one time each,
	 * and thus should be added in the Command's constructor. Multiple middleware
	 * functions can be added to a command via multiple calls to this method
	 * @memberof Command
	 * @instance
	 * @param {MiddlewareFunction} fn Middleware function. <code>(message, args) => [message, args]</code>
	 * @returns {Command} This command instance
	 */
	public use(fn: MiddlewareFunction): this
	{
		this._middleware.push(fn);
		return this;
	}

	/**
	 * Send provided response text to the command's calling channel
	 * via edit, editCode, send, or sendCode depending on whether
	 * or not the bot is a selfbot and/or a codeblock language is given
	 * @protected
	 */
	protected _respond(message: Message, response: string, code?: string): Promise<Message | Message[]>
	{
		if (this.bot.selfbot && !code) return message.edit(response);
		if (this.bot.selfbot && code) return message.editCode(code, response);
		if (code) return message.channel.sendCode(code, response);
		return message.channel.sendMessage(response);
	}
}
