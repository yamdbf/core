'use babel';
'use strict';

/**
 * Command class to extend to create commands users can execute
 * @class Command
 * @param {Bot} bot - Bot instance
 * @param {CommandInfo} info - Object containing required command properties
 */
export default class Command
{
	constructor(bot, info = null)
	{
		// Assert necessary command information
		const name = this.constructor.name;
		if (!info) throw new Error(`You must provide an info object for command: ${name}`);
		if (!info.name) throw new Error(`You must provide a name for command: ${name}`);
		if (!info.description) throw new Error(`You must provide a description for command: ${name}`);
		if (!info.usage) throw new Error(`You must provide usage information for command: ${name}`);
		if (!info.group) throw new Error(`You must provide a group for command: ${name}`);
		if (info.aliases && !Array.isArray(info.aliases)) throw new Error(`Aliases for command ${name} must be an array`);
		if (info.permissions && !Array.isArray(info.permissions)) throw new Error(`Permissions for command ${name} must be an array`);
		if (info.permissions && info.permissions.length > 0)
		{
			info.permissions.forEach((perm, index) =>
			{
				try
				{
					bot.resolver.resolvePermission(perm);
				}
				catch (err)
				{
					throw new Error(`Command#${name} permission "${info.permissions[index]}" at ${name}.permissions[${index}] is not a valid permission.\n\n${err}`);
				}
			});
		}
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
		 * Whether or not to pass all args as strings, skipping number parsing.
		 * Should definitely be used when writing commands that take Discord.js
		 * object (Guild, User, Message, etc) ids as arguments as Javascript
		 * loses accuracy on integers above 2^53 and it will not parse
		 * your ids correctly as a result.
		 * @memberof Command
		 * @type {boolean}
		 * @name stringArgs
		 * @instance
		 */
		this.stringArgs = info.stringArgs || false;

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

		if (this.overloads && this.group !== 'base') throw new Error('Commands may only overload commands in group "base"');

		// Default guildOnly to true if permissions/roles are given
		if (this.permissions.length > 0 || this.roles.length > 0) this.guildOnly = true;
	}

	/**
	 * @typedef {Array<*>} args - Array of values parsed from {@link external:Message} content
	 * that will be passed to a command. Can contain a mix of string and number values.
	 */

	/**
	 * Action to be executed when the command is called. The following parameters
	 * are what command actions will be passed by the {@link CommandDispatcher} whenever
	 * a command is called. Be sure to receive these in proper order when writing
	 * new commands
	 * @memberof Command
	 * @instance
	 * @param {external:Message} message - Discord.js message object
	 * @param {args[]} args - An array containing the args parsed from the command calling message
	 * @param {external:User[]} mentions - An array containing the Discord.js User
	 * objects parsed from the mentions contained in a message
	 * @param {string} original - The original raw content of the message that called the command
	 */
	async action()
	{
		throw new Error(`${this.constructor.name} has not overloaded the command action method`);
	}

	/**
	 * Assert {@link Command#action} is typeof Function, finishing the
	 * command creation process.<br>Called by {@link CommandRegistry#register}
	 * @memberof Command
	 * @instance
	 */
	register()
	{
		let name = this.constructor.name;
		if (!this.action) throw new Error(`Command#${name}.action: expected Function, got: ${typeof this.action}`);
		if (!this.action instanceof Function) throw new Error(`Command#${name}.action: expected Function, got: ${typeof this.action}`);
	}

	// Send provided response text to the command's calling channel
	// via edit, editCode, sendMessage, or sendCode depending on Whether
	// or not the bot is a selfbot and/or a codeblock language is given
	_respond(message, response, code)
	{
		if (this.bot.selfbot && !code) return message.edit(response);
		if (this.bot.selfbot && code) return message.editCode(code, response);
		if (code) return message.channel.sendCode(code, response);
		return message.channel.sendMessage(response);
	}
}

/**
 * @typedef {Object} CommandInfo - Object containing required {@link Command} properties
 * to be passed to a Command on construction
 * @property {string} name - See: {@link Command#name}
 * @property {string} description - See: {@link Command#description}
 * @property {string} usage - See: {@link Command#usage}
 * @property {string} extraHelp - See: {@link Command#extraHelp}
 * @property {string} group - See: {@link Command#group}
 * @property {string[]} [aliases=[]] - See: {@link Command#aliases}
 * @property {boolean} [guildOnly=false] - See: {@link Command#guildOnly}
 * @property {boolean} [stringArgs=false] - See: {@link Command#stringArgs}
 * @property {PermissionResolvable[]} [permissions=[]] - See: {@link Command#permissions}
 * @property {string[]} [roles=[]] - See: {@link Command#roles}
 * @property {boolean} [ownerOnly=false] - See: {@link Command#ownerOnly}
 * @property {string} [overloads=null] - See: {@link Command#overloads}
 */
