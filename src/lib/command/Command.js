'use babel';
'use strict';

// Command class to extend to create commands users can execute
export default class Command
{
	constructor(bot, info = null)
	{
		// Assert necessary command information
		let name = this.constructor.name;
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

		this.bot = bot;
		this.name = info.name;
		this.description = info.description;
		this.usage = info.usage;
		this.extraHelp = info.extraHelp;
		this.group = info.group;
		this.aliases = info.aliases || [];
		this.permissions = info.permissions || [];
		this.roles = info.roles || [];
		this.ownerOnly = info.ownerOnly || false;

		this.command = info.command || null;
		this.action = this.action || null;
	}

	async doAction(message)
	{
		this.action(message);
	}

	// Make sure command is RegExp and action is Function
	register()
	{
		// this.action = this._action;
		let name = this.constructor.name;
		if (!this.command) throw new Error(`Command#${name}.command: expected RegExp, got: ${typeof this.command}`);
		if (this.command.constructor.name !== 'RegExp') throw new Error(`Command#${name}.command: expected RegExp, got: ${typeof this.command}`);
		if (!this.action) throw new Error(`Command#${name}.action: expected Function, got: ${typeof this.action}`);
		if (!this.action instanceof Function) throw new Error(`Command#${name}.action: expected Function, got: ${typeof this.action}`);
	}
}
