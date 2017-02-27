'use babel';
'use strict';
import now from 'performance-now';

/**
 * Handles dispatching commands
 * @class CommandDispatcher
 * @param {Bot} bot - Bot instance
 */
export default class CommandDispatcher
{
	constructor(bot)
	{
		/** @type {Bot} */
		this._bot = bot;

		// Register message listener
		if (!this._bot.passive) this._bot.on('message', message => this.handleMessage(message));
	}

	// Handle received messages
	async handleMessage(message)
	{
		const dispatchStart = now();
		if (this._bot.selfbot && message.author !== this._bot.user) return;
		if (message.author.bot) return;

		const dm = ['dm', 'group'].includes(message.channel.type);
		if (!dm) message.guild.storage = this._bot.guildStorages.get(message.guild);

		const [commandCalled, command, prefix] = this.isCommandCalled(message);
		if (!commandCalled) return;

		if (!(!dm && prefix === message.guild.storage.getSetting('prefix')) && prefix !== ''
			&& (message.content.match(new RegExp(`<@!?${this._bot.user.id}>`, 'g')) || []).length === 1)
			message.mentions.users.delete(this._bot.user.id);

		let validCaller = false;
		try { validCaller = this.testCommand(command, message); }
		catch (err) { message[this._bot.selfbot ? 'channel' : 'author'].send(err); }
		if (!validCaller) return;

		let args = message.content.trim()
			.slice(prefix.length).trim()
			.split(' ')
			.slice(1)
			.join(' ')
			.split(command.argOpts.separator)
			.map(a => a.trim())
			.filter(a => a !== '');

		let middlewarePassed = true;
		for (let middleware of command._middleware)
			try
			{
				let result = middleware.call(command, message, args);
				if (result instanceof Promise) result = await result;
				if (!(result instanceof Array))
				{
					if (typeof result === 'string') message.channel.send(result);
					middlewarePassed = false;
					break;
				}
				[message, args] = result;
			}
			catch (err)
			{
				middlewarePassed = false;
				message.channel.send(err.toString());
				break;
			}

		if (middlewarePassed)
			await this.dispatch(command, message, args).catch(console.error);

		const dispatchEnd = now() - dispatchStart;

		/**
		 * Emitted whenever a command is successfully called
		 * @memberof Bot
		 * @instance
		 * @event event:command
		 * @param {string} name - Name of the called command
		 * @param {args[]} args - Args passed to the called command
		 * @param {number} execTime - Time command took to execute
		 * @param {external:Message} message - Message that triggered the command
		 */
		this._bot.emit('command', command.name, args, dispatchEnd, message);
	}

	// Return if a command has been called, the called command
	// and the prefix used to call the command
	isCommandCalled(message)
	{
		const dm = ['dm', 'group'].includes(message.channel.type);
		const prefixes = [
			`<@${this._bot.user.id}>`,
			`<@!${this._bot.user.id}>`
		];

		if (!dm) prefixes.push(message.guild.storage.getSetting('prefix'));

		let prefix = prefixes.find(a => message.content.trim().startsWith(a));

		if (dm && !prefix) prefix = '';
		if (!prefix && !dm) return [false];

		const commandName = message.content.trim()
			.slice(prefix.length).trim()
			.split(' ')[0];

		const command = this._bot.commands.find(c =>
			c.name === commandName || c.aliases.includes(commandName));

		if (!command) return [false];
		return [true, command, prefix];
	}

	// Test if the command caller is allowed to use the command
	// under whatever circumstances are present at call-time
	testCommand(command, message)
	{
		const config = this._bot.config;
		const dm = ['dm', 'group'].includes(message.channel.type);
		const storage = !dm ? this._bot.guildStorages.get(message.guild) : null;

		if (!dm && storage.settingExists('disabledGroups')
			&& storage.getSetting('disabledGroups').includes(command.group)) return false;
		if (command.ownerOnly && !config.owner.includes(message.author.id)) return false;

		if (dm && command.guildOnly) throw this.guildOnlyError();
		let missingPermissions = this.checkPermissions(command, message, dm);
		if (missingPermissions.length > 0) throw this.missingPermissionsError(missingPermissions);
		if (!this.checkLimiter(command, message, dm)) throw this.failedLimiterError(command, message);
		if (!this.hasRoles(command, message, dm)) throw this.missingRolesError(command);

		return true;
	}

	// Compare user permissions to the command's requisites
	checkPermissions(command, message, dm)
	{
		return this._bot.selfbot || dm ? [] : command.permissions.filter(a =>
			!message.channel.permissionsFor(message.author).hasPermission(a));
	}

	// Compare user roles to the command's limiter
	checkLimiter(command, message, dm)
	{
		if (dm || this._bot.selfbot) return true;
		let storage = this._bot.guildStorages.get(message.guild);
		let limitedCommands = storage.getSetting('limitedCommands') || {};
		if (!limitedCommands[command.name]) return true;
		if (limitedCommands[command.name].length === 0) return true;
		return message.member.roles.filter(role =>
			limitedCommands[command.name].includes(role.id)).size > 0;
	}

	// Compare user roles to the command's requisites
	hasRoles(command, message, dm)
	{
		return this._bot.selfbot || command.roles.length === 0 || dm
			|| message.member.roles.filter(role =>
				command.roles.includes(role.name)).size > 0;
	}

	// Execute the provided command with the provided args
	async dispatch(command, message, args)
	{
		return new Promise((resolve, reject) =>
		{
			try
			{
				const action = command.action(message, args);
				if (action instanceof Promise) action.then(resolve).catch(reject);
				else resolve(action);
			}
			catch (err)
			{
				reject(err);
			}
		});
	}

	guildOnlyError()
	{
		return `That command is for servers only. Try saying "help" to see a `
			+ `list of commands you can use in this DM`;
	}

	missingPermissionsError(missing)
	{
		return `**You're missing the following permission`
			+ `${missing.length > 1 ? 's' : ''} `
			+ `for that command:**\n\`\`\`css\n`
			+ `${missing.join(', ')}\n\`\`\``;
	}

	failedLimiterError(command, message)
	{
		const storage = this._bot.guildStorages.get(message.guild);
		let limitedCommands = storage.getSetting('limitedCommands');
		let roles = limitedCommands[command.name];
		return `**You must have ${roles.length > 1
			? 'one of the following roles' : 'the following role'}`
			+ ` to use that command:**\n\`\`\`css\n`
			+ `${message.guild.roles
				.filter(role => roles.includes(role.id))
				.map(role => role.name).join(', ')}\n\`\`\``;
	}

	missingRolesError(command)
	{
		return `**You must have ${command.roles.length > 1
				? 'one of the following roles' : 'the following role'}`
			+ ` to use that command:**\n\`\`\`css\n`
			+ `${command.roles.join(', ')}\n\`\`\``;
	}
}
