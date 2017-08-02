import { PermissionResolvable, TextChannel, User } from 'discord.js';
import { RateLimiter } from './RateLimiter';
import { MiddlewareFunction } from '../types/MiddlewareFunction';
import { ResourceLoader } from '../types/ResourceLoader';
import { BaseStrings as s } from '../localization/BaseStrings';
import { Logger, logger } from '../util/logger/Logger';
import { Message } from '../types/Message';
import { GuildStorage } from '../types/GuildStorage';
import { Command } from '../command/Command';
import { Client } from '../client/Client';
import { RateLimit } from './RateLimit';
import { Time } from '../util/Time';
import { Lang } from '../localization/Lang';
import { Util } from '../util/Util';

/**
 * Handles dispatching commands
 * @private
 */
export class CommandDispatcher<T extends Client>
{
	@logger private readonly _logger: Logger;
	private readonly _client: T;
	private _ready: boolean = false;
	public constructor(client: T)
	{
		this._client = client;

		if (!this._client.passive)
			this._client.on('message', message =>
				{ if (this._ready) this.handleMessage(message); });
	}

	/**
	 * Set the dispatcher as ready to receive and dispatch commands
	 */
	public setReady(): void
	{
		this._ready = true;
	}

	/**
	 * Handle received messages
	 */
	private async handleMessage(message: Message): Promise<void>
	{
		const dispatchStart: number = Util.now();
		const dm: boolean = message.channel.type !== 'text';

		// Don't continue for bots and don't continue
		// for other users when the client is a selfbot
		if (message.author.bot) return;
		if (this._client.selfbot && message.author.id !== this._client.user.id) return;

		// Set `message.guild.storage` if message is not a DM
		if (!dm) message.guild.storage = this._client.storage.guilds.get(message.guild.id);

		// Don't bother with anything else if author is blacklisted
		if (await this.isBlacklisted(message.author, message, dm)) return;

		const lang: string = dm
			? this._client.defaultLang
			: await message.guild.storage.settings.get('lang')
				|| this._client.defaultLang;
		const res: ResourceLoader = Lang.createResourceLoader(lang);

		type CommandCallData = [boolean, Command, string, string];
		const [commandWasCalled, command, prefix, name]: CommandCallData =
			await Util.wasCommandCalled(message);

		if (!commandWasCalled)
		{
			if (dm && this._client.unknownCommandError)
				message.channel.send(this.unknownCommandError(res));
			return;
		}

		let validCall: boolean = false;
		try { validCall = await this.canCallCommand(res, <Command<T>> command, message, dm); }
		catch (err) { message[this._client.selfbot ? 'channel' : 'author'].send(err); }
		if (!validCall) return;

		// Remove clientuser from message.mentions if only mentioned one time as a prefix
		const clientMention: RegExp = new RegExp(`<@!?${this._client.user.id}>`, 'g');
		const startsWithClientMention: RegExp = new RegExp(`^${clientMention.source}`);
		if (startsWithClientMention.test(message.content)
			&& (message.content.match(clientMention) || []).length === 1)
			message.mentions.users.delete(this._client.user.id);

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
				message.channel.send(err.toString(), { split: true });
				break;
			}

		if (!middlewarePassed) return;

		try { await command.action(message, args); }
		catch (err) { this._logger.error(`Dispatch:${command.name}`, err.stack); }

		const dispatchEnd: number = Util.now() - dispatchStart;
		this._client.emit('command', command.name, args, dispatchEnd, message);
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
	 * Return whether or not the command is allowed to be called based
	 * on whatever circumstances are present at call-time, throwing
	 * appropriate errors as necessary for unsatisfied conditions
	 */
	private async canCallCommand(res: ResourceLoader, command: Command<T>, message: Message, dm: boolean): Promise<boolean>
	{
		const storage: GuildStorage = !dm ? this._client.storage.guilds.get(message.guild.id) : null;

		if (command.ownerOnly && !this._client.isOwner(message.author)) return false;
		if (!dm && (await storage.settings.get('disabledGroups') || []).includes(command.group)) return false;
		if (!this.passedRateLimiters(res, message, command)) return false;

		if (dm && command.guildOnly)
			throw this.guildOnlyError(res);

		const missingClientPermissions: PermissionResolvable[] = this.checkClientPermissions(command, message, dm);
		if (missingClientPermissions.length > 0)
		{
			// Explicitly send this error to the channel rather than throwing
			message.channel.send(this.missingClientPermissionsError(res, missingClientPermissions));
			return false;
		}

		const missingCallerPermissions: PermissionResolvable[] = this.checkCallerPermissions(command, message, dm);
		if (missingCallerPermissions.length > 0)
			throw this.missingCallerPermissionsError(res, missingCallerPermissions);

		if (!(await this.passedRoleLimiter(command, message, dm)))
			throw await this.failedLimiterError(res, command, message);

		if (!this.hasRoles(command, message, dm))
			throw this.missingRolesError(res, command);

		return true;
	}

	/**
	 * Return whether or not the message author passed global
	 * and command-specific ratelimits for the given command
	 */
	private passedRateLimiters(res: ResourceLoader, message: Message, command: Command<T>): boolean
	{
		const passedGlobal: boolean = !this.isRateLimited(res, message);
		const passedCommand: boolean = !this.isRateLimited(res, message, command);
		const passedAllLimiters: boolean = passedGlobal && passedCommand;

		if (passedAllLimiters)
			if (!(command && command._rateLimiter && !command._rateLimiter.get(message).call())
				&& this._client._rateLimiter)
				this._client._rateLimiter.get(message).call();

		return passedAllLimiters;
	}

	/**
	 * Check global or command-specific ratelimits for the given message
	 * author, notify them if they exceed ratelimits, and return whether
	 * or not the user is ratelimited
	 */
	private isRateLimited(res: ResourceLoader, message: Message, command?: Command<T>): boolean
	{
		const rateLimiter: RateLimiter = command ? command._rateLimiter : this._client._rateLimiter;
		if (!rateLimiter) return false;

		const rateLimit: RateLimit = rateLimiter.get(message);
		if (!rateLimit.isLimited) return false;

		if (!rateLimit.wasNotified)
		{
			const globalLimiter: RateLimiter = this._client._rateLimiter;
			const globalLimit: RateLimit = globalLimiter ? globalLimiter.get(message) : null;
			if (globalLimit && globalLimit.isLimited && globalLimit.wasNotified) return true;

			rateLimit.setNotified();
			if (!command) message.channel.send(
				res(s.DISPATCHER_ERR_RATELIMIT_EXCEED_GLOBAL,
					{ time: Time.difference(rateLimit.expires, Date.now()).toString() }));
			else message.channel.send(
				res(s.DISPATCHER_ERR_RATELIMIT_EXCEED,
					{ time: Time.difference(rateLimit.expires, Date.now()).toString() }));
		}

		return true;
	}

	/**
	 * Return permissions the client is missing to execute the given command
	 */
	private checkClientPermissions(command: Command<T>, message: Message, dm: boolean): PermissionResolvable[]
	{
		return dm ? [] : command.clientPermissions.filter(a =>
			!(<TextChannel> message.channel).permissionsFor(this._client.user).has(a));
	}

	/**
	 * Return the permissions the caller is missing to call the given command
	 */
	private checkCallerPermissions(command: Command<T>, message: Message, dm: boolean): PermissionResolvable[]
	{
		return this._client.selfbot || dm ? [] : command.callerPermissions.filter(a =>
			!(<TextChannel> message.channel).permissionsFor(message.author).has(a));
	}

	/**
	 * Return whether or not the message author passes the role limiter
	 */
	private async passedRoleLimiter(command: Command<T>, message: Message, dm: boolean): Promise<boolean>
	{
		if (dm || this._client.selfbot) return true;

		const storage: GuildStorage = this._client.storage.guilds.get(message.guild.id);
		const limitedCommands: { [name: string]: string[] } = await storage.settings.get('limitedCommands') || {};

		if (!limitedCommands[command.name]) return true;
		if (limitedCommands[command.name].length === 0) return true;

		return message.member.roles.filter(role =>
			limitedCommands[command.name].includes(role.id)).size > 0;
	}

	/**
	 * Return whether or not the user has one of the roles specified
	 * in the command's requisite roles
	 */
	private hasRoles(command: Command<T>, message: Message, dm: boolean): boolean
	{
		return this._client.selfbot || command.roles.length === 0 || dm
			|| message.member.roles.filter(role =>
				command.roles.includes(role.name)).size > 0;
	}

	/**
	 * Return an error for unknown commands in DMs
	 */
	private unknownCommandError(res: ResourceLoader): string
	{
		return res(s.DISPATCHER_ERR_UNKNOWN_COMMAND);
	}

	/**
	 * Return an error for guild only commands
	 */
	private guildOnlyError(res: ResourceLoader): string
	{
		return res(s.DISPATCHER_ERR_GUILD_ONLY);
	}

	/**
	 * Return an error for missing caller permissions
	 */
	private missingClientPermissionsError(res: ResourceLoader, missing: PermissionResolvable[]): string
	{
		return res(s.DISPATCHER_ERR_MISSING_CLIENT_PERMISSIONS, { missing: missing.join(', ') });
	}

	/**
	 * Return an error for missing caller permissions
	 */
	private missingCallerPermissionsError(res: ResourceLoader, missing: PermissionResolvable[]): string
	{
		return res(s.DISPATCHER_ERR_MISSING_CALLER_PERMISSIONS, { missing: missing.join(', ') });
	}

	/**
	 * Return an error for failing a command limiter
	 */
	private async failedLimiterError(res: ResourceLoader, command: Command<T>, message: Message): Promise<string>
	{
		const storage: GuildStorage = this._client.storage.guilds.get(message.guild.id);
		const limitedCommands: { [name: string]: string[] } = await storage.settings.get('limitedCommands');
		const roles: string[] = message.guild.roles
			.filter(r => limitedCommands[command.name].includes(r.id))
			.map(r => r.name);

		return res(s.DISPATCHER_ERR_MISSING_ROLES, { roles: roles.join(', ')});
	}

	/**
	 * Return an error for missing roles
	 */
	private missingRolesError(res: ResourceLoader, command: Command<T>): string
	{
		return res(s.DISPATCHER_ERR_MISSING_ROLES, { roles: command.roles.join(', ') });
	}
}
