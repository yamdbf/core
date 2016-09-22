require(Globals);

/**
 * Description
 * @extends {command}
 */
class CommandName extends Command
{
	constructor()
	{
		super();
		// Admin defaults to false in parent class so the admin property
		// can safely be removed if the command is not admin only.
		// Set to true, however, if it is an admin only command.
		// Helptext values can also be safely removed for admin commands.
		this.admin = false;

		// Helptext values
		this.name         = ``;
		this.description  = ``;
		this.alias        = ``;
		this.usage        = ``;
		this.help         = ``;
		this.permsissions = [];

		// Activation command regex
		this.command = /^command$/;

		/**
		 * Action to take when the command is received
		 * @param  {object} message message object passed by parent caller
		 * @param  {method} resolve resolve method of parent Promise
		 * @param  {method} reject reject method of parent Promise
		 * @returns {null}
		 */
		this.action = (message, resolve, reject) =>
		{

		}
	}
}

module.exports = CommandName;
