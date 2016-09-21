/**
 * Class containing regex for detecting a chat command and
 * an action that will be executed the the chat command is
 * called. Commands are to be registered using a Bot's
 * CommandRegistry. A class extending Command should overwrite
 * the default properties defined in the class constructor.
 * Only the command and action properties are required,
 * but the helptext properties name, desc, usage, and help
 * should be overwritten for sure to give docs for the help
 * command.
 */
class Command
{
	/**
	 * @property {regex} command      activation chat command regex to match
	 *                                Capture groups can be used in the command for
	 *                                parsing the command message
	 * @property {method} action      action that will be executed
	 *                                Action must receive the message object as well as
	 *                                the Promise resolve and reject methods when created
	 * @property {string} name        helptext name of command, displayed in help list
	 * @property {string} description helptext description of command
	 * @property {string} usage  	  helptext usage of command
	 * @property {string} help    	  helptext additional information about command
	 * @property {string} alias  	  helptext optional alias, does not need to be defined
	 *                             	  or passed to super at class creation
	 * @property {Array} permissions  array of PermissionResolvable strings, only users
	 *                                with the provided permissions can call the command
	 * @property {boolean} admin      if command is an admin command. Admin commands
	 *                                will not be displayed in the help command
	 */
	constructor()
	{
		this.command     = undefined;
		this.action      = undefined;
		this.name        = ``;
		this.description = ``;
		this.usage       = ``;
		this.help        = ``;
		this.alias       = ``;
		this.permissions = [];
		this.admin       = false;
	}

	/**
	 * Assign the bot instance to the command and make
	 * sure command is valid
	 * @param {Bot} bot Discord.js client instance
	 * @returns {null}
	 */
	Register(bot)
	{
		// Assert valid Command properties
		let name = this.constructor.name;
		assert(this.command, `Command#${name}.command: expected regex, got: ${typeof this.command}`);
		assert(this.command.constructor.name === "RegExp", `Command#${name}.command: expected regex, got: ${typeof this.command}`);
		assert(this.action, `Command#${name}.action: expected Function, got: ${typeof this.action}`);
		assert(this.action instanceof Function, `Command#${name}.action: expected Function, got: ${typeof this.action}`);
		assert(this.permissions.constructor === Array, `Command#${name}.perms: expected Array, got: ${typeof this.permissions}`);
		if (this.permissions.length > 0)
		{
			this.permissions.forEach( (perm, index) =>
			{
				try
				{
					this.bot.resolver.resolvePermission(perm);
				}
				catch (e)
				{
					console.log(e);
					throw new Error(`Command#${name} permission "${this.permissions[index]}" at ${name}.perms[${index}] is not a valid permission.`);
				}
			})
		}

		this.bot = bot;
	}

	/**
	 * Return a promise with the action to be executed
	 * @param {object} message message object passed by parent caller
	 * @returns {Promise}
	 */
	DoAction(message)
	{
		this.async = new Promise( (resolve, reject) =>
		{
			this.action(message, resolve, reject);
		});

		return this.async;
	}
}

 module.exports = Command;
