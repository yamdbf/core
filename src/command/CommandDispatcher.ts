import { PermissionResolvable, TextChannel, User } from 'discord.js';
import { RateLimiter } from './RateLimiter';
import { MiddlewareFunction } from '../types/MiddlewareFunction';
import { Message } from '../types/Message';
import { GuildStorage } from '../types/GuildStorage';
import { Command } from '../command/Command';
import { Client } from '../client/Client';
import { RateLimit } from './RateLimit';
import { Time } from '../util/Time';
import now = require('performance-now');

/**
 * Handles dispatching commands
 * @private
 */
export class CommandDispatcher<T extends Client>
{
	private readonly _client: T;
	public constructor(client: T)
	{
		this._client = client;

		// Register message listener
		if (!this._client.passive) this._client.on('message', message => this.handleMessage(message));
	}

	/**
	 * Handle received messages
	 */
	private async handleMessage(message: Message): Promise<void>
	{
		const dispatchStart: number = now();
		if (this._client.selfbot && message.author !== this._client.user) return;
		if (message.author.bot) return;

		const dm: boolean = message.channel.type !== 'text';
		if (!dm) message.guild.storage = this._client.storage.guilds.get(message.guild.id);

		// Check blacklist
		if (await this.isBlacklisted(message.author, message, dm)) return;

		const [commandCalled, command, prefix, name]: [boolean, Command<T>, string, string] = await this.isCommandCalled(message);
		if (!commandCalled)
		{
			if (dm && this._client.unknownCommandError)
				message.channel.send(this.unknownCommandError());
			return;
		}
		if (command.ownerOnly && !this._client.isOwner(message.author)) return;

		// Check ratelimits
		if (!this.checkRateLimits(message, command)) return;

		// Remove clientuser from message.mentions if only mentioned one time as a prefix
		if (!(!dm && prefix === await message.guild.storage.settings.get('prefix')) && prefix !== ''
			&& (message.content.match(new RegExp(`<@!?${this._client.user.id}>`, 'g')) || []).length === 1)
			message.mentions.users.delete(this._client.user.id);

		let validCaller: boolean = false;
		try { validCaller = await this.testCommand(command, message); }
		catch (err) { message[this._client.selfbot ? 'channel' : 'author'].send(err); }
		if (!validCaller) return;

		let args: string[] = message.content
			.replace(prefix, '').replace(name, '')
			.trim()
			.split(command.argOpts.separator)
			.map(a => a.trim())
			.filter(a => a !== '');

		let middlewarePassed: boolean = true;
		let middleware: MiddlewareFunction[] = this._client._middleware.concat(command._middleware);
		for (let func of middleware)
			try
			{
				let result: Promise<[Message, any[]]> | [Message, any[]] =
					func.call(command, message, args);
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

		const dispatchEnd: number = now() - dispatchStart;

		this._client.emit('command', command.name, args, dispatchEnd, message);
	}

	/**
	 * Return if a command has been called, the called command
	 * the prefix used to call the command, and the name or alias
	 * of the command used to call it
	 */
	private async isCommandCalled(message: Message): Promise<[boolean, Command<T>, string, string]>
	{
		const dm: boolean = message.channel.type !== 'text';
		const prefixes: string[] = [
			`<@${this._client.user.id}>`,
			`<@!${this._client.user.id}>`
		];

		if (!dm) prefixes.push(await message.guild.storage.settings.get('prefix'));

		let prefix: string = prefixes.find(a => message.content.trim().startsWith(a));

		if (dm && !prefix) prefix = '';
		if (!prefix && !dm) return [false, null, null, null];

		const commandName: string = message.content.trim()
			.slice(prefix.length).trim()
			.split(' ')[0];

		const command: Command<T> = this._client.commands.find(c =>
			c.name === commandName || c.aliases.includes(commandName));

		if (!command) return [false, null, null, null];
		return [true, command, prefix, commandName];
	}

	/**
	 * Test if the command caller is allowed to use the command
	 * under whatever circumstances are present at call-time
	 */
	private async testCommand(command: Command<T>, message: Message): Promise<boolean>
	{
		const dm: boolean = message.channel.type !== 'text';
		const storage: GuildStorage = !dm ? this._client.storage.guilds.get(message.guild.id) : null;

		if (!dm && typeof await storage.settings.get('disabledGroups') !== 'undefined'
			&& (await storage.settings.get('disabledGroups')).includes(command.group)) return false;

		if (dm && command.guildOnly) throw this.guildOnlyError();
		let missingPermissions: PermissionResolvable[] = this.checkPermissions(command, message, dm);
		if (missingPermissions.length > 0) throw this.missingPermissionsError(missingPermissions);
		if (!(await this.checkLimiter(command, message, dm))) throw await this.failedLimiterError(command, message);
		if (!this.hasRoles(command, message, dm)) throw this.missingRolesError(command);

		return true;
	}

	/**
	 * Check either global or command-specific rate limits for the given
	 * message author and also notify them if they exceed ratelimits
	 */
	private checkRateLimiter(message: Message, command?: Command<T>): boolean
	{
		const rateLimiter: RateLimiter = command ? command._rateLimiter : this._client._rateLimiter;
		if (!rateLimiter) return true;

		const rateLimit: RateLimit = rateLimiter.get(message);
		if (!rateLimit.isLimited) return true;

		if (!rateLimit.wasNotified)
		{
			const globalLimiter: RateLimiter = this._client._rateLimiter;
			const globalLimit: RateLimit = globalLimiter ? globalLimiter.get(message) : null;
			if (globalLimit && globalLimit.isLimited && globalLimit.wasNotified) return;

			rateLimit.setNotified();
			if (!command) message.channel.send(
				`You have used too many commands and may not use any more for **${
					Time.difference(rateLimit.expires, Date.now()).toString()}**.`);
			else message.channel.send(
				`You have used this command too many times and may not use it again for **${
					Time.difference(rateLimit.expires, Date.now()).toString()}**.`);
		}
		return false;
	}

	/**
	 * Check global and command-specific ratelimits for the user
	 * for the given command
	 */
	private checkRateLimits(message: Message, command: Command<T>): boolean
	{
		let passedGlobal: boolean = true;
		let passedCommand: boolean = true;
		let passedRateLimiters: boolean = true;
		if (!this.checkRateLimiter(message)) passedGlobal = false;
		if (!this.checkRateLimiter(message, command)) passedCommand = false;
		if (!passedGlobal || !passedCommand) passedRateLimiters = false;
		if (passedRateLimiters)
			if (!(command && command._rateLimiter && !command._rateLimiter.get(message).call()) && this._client._rateLimiter)
				this._client._rateLimiter.get(message).call();
		return passedRateLimiters;
	}

	/**
	 * Compare user permissions to the command's requisites
	 */
	private checkPermissions(command: Command<T>, message: Message, dm: boolean): PermissionResolvable[]
	{
		return this._client.selfbot || dm ? [] : command.permissions.filter(a =>
			!(<TextChannel> message.channel).permissionsFor(message.author).has(a));
	}

	/**
	 * Compare user roles to the command's limiter
	 */
	private async checkLimiter(command: Command<T>, message: Message, dm: boolean): Promise<boolean>
	{
		if (dm || this._client.selfbot) return true;
		let storage: GuildStorage = this._client.storage.guilds.get(message.guild.id);
		let limitedCommands: { [name: string]: string[] } = await storage.settings.get('limitedCommands') || {};
		if (!limitedCommands[command.name]) return true;
		if (limitedCommands[command.name].length === 0) return true;
		return message.member.roles.filter(role =>
			limitedCommands[command.name].includes(role.id)).size > 0;
	}

	/**
	 * Compare user roles to the command's requisites
	 */
	private hasRoles(command: Command<T>, message: Message, dm: boolean): boolean
	{
		return this._client.selfbot || command.roles.length === 0 || dm
			|| message.member.roles.filter(role =>
				command.roles.includes(role.name)).size > 0;
	}

	/**
	 * Check if the calling user is blacklisted
	 */
	private async isBlacklisted(user: User, message: Message, dm: boolean): Promise<boolean>
	{
		if (await this._client.storage.get(`blacklist.${user.id}`)) return true;
		if (!dm && await message.guild.storage.settings.get(`blacklist.${user.id}`)) return true;
		return false;
	}

	/**
	 * Execute the provided command with the provided args
	 */
	private async dispatch(command: Command<T>, message: Message, args: any[]): Promise<any>
	{
		return new Promise((resolve, reject) =>
		{
			try
			{
				const action: any = command.action(message, args);
				if (action instanceof Promise) action.then(resolve).catch(reject);
				else resolve(action);
			}
			catch (err)
			{
				reject(err);
			}
		});
	}

	/**
	 * Return an error for unknown commands in DMs
	 */
	private unknownCommandError(): string
	{
		return `Sorry, I didn't recognize any command in your message.\n`
			+ `Try saying "help" to view a list of commands you can use in `
			+ `this DM, or try calling the\nhelp command in a server channel `
			+ `to see what commands you can use there!`;
	}

	/**
	 * Return an error for guild only commands
	 */
	private guildOnlyError(): string
	{
		return `That command is for servers only. Try saying "help" to see a `
			+ `list of commands you can use in this DM`;
	}

	/**
	 * Return an error for missing permissions
	 */
	private missingPermissionsError(missing: PermissionResolvable[]): string
	{
		return `**You're missing the following permission`
			+ `${missing.length > 1 ? 's' : ''} `
			+ `for that command:**\n\`\`\`css\n`
			+ `${missing.join(', ')}\n\`\`\``;
	}

	/**
	 * Return an error for failing a command limiter
	 */
	private async failedLimiterError(command: Command<T>, message: Message): Promise<string>
	{
		const storage: GuildStorage = this._client.storage.guilds.get(message.guild.id);
		let limitedCommands: { [name: string]: string[] } = await storage.settings.get('limitedCommands');
		let roles: string[] = limitedCommands[command.name];
		return `**You must have ${roles.length > 1
			? 'one of the following roles' : 'the following role'}`
			+ ` to use that command:**\n\`\`\`css\n`
			+ `${message.guild.roles
				.filter(role => roles.includes(role.id))
				.map(role => role.name).join(', ')}\n\`\`\``;
	}

	/**
	 * Return an error for missing roles
	 */
	private missingRolesError(command: Command<T>): string
	{
		return `**You must have ${command.roles.length > 1
			? 'one of the following roles' : 'the following role'}`
			+ ` to use that command:**\n\`\`\`css\n`
			+ `${command.roles.join(', ')}\n\`\`\``;
	}
}
