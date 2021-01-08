/* eslint-disable no-await-in-loop */
/* eslint-disable no-param-reassign */
/* eslint-disable require-atomic-updates */
/* eslint-disable complexity */
import { Logger, logger } from '../util/logger/Logger';
import { PermissionResolvable, TextChannel, User, MessageOptions, Message as DMessage, Guild } from 'discord.js';
import { Client } from '../client/Client';
import { Command } from '../command/Command';
import { CommandLock } from './CommandLock';
import { CompactModeHelper } from './CompactModeHelper';
import { GuildStorage } from '../storage/GuildStorage';
import { Lang } from '../localization/Lang';
import { Message } from '../types/Message';
import { MiddlewareFunction } from '../types/MiddlewareFunction';
import { RateLimit } from './RateLimit';
import { RateLimitManager } from './RateLimitManager';
import { ResourceProxy } from '../types/ResourceProxy';
import { Time } from '../util/Time';
import { Util } from '../util/Util';
import { format } from 'util';
import { BaseStrings as s } from '../localization/BaseStrings';

/**
 * Handles dispatching commands
 * @private
 */
export class CommandDispatcher
{
	@logger private readonly _logger!: Logger;
	private readonly _client: Client;
	private _locks: { [guild: string]: { [command: string]: CommandLock } };
	private _ready: boolean = false;

	public constructor(client: Client)
	{
		this._client = client;
		this._locks = {};

		if (!this._client.passive)
		{
			this._client.on('message', (async (message: Message) =>
			{
				if (this._ready)
				{
					const wasCommandCalled: boolean = await this._handleMessage(message);
					if (!wasCommandCalled)
						this._client.emit('noCommand', message);
				}
			}) as any);
		}
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
	private async _handleMessage(message: Message): Promise<boolean>
	{
		const dispatchStart: number = Util.now();
		const dm: boolean = message.channel.type !== 'text';

		// Dismiss messages with no author
		if (!message.author) return false;

		// Dismiss messages from bots
		if (message.author.bot) return false;

		// Fail silently if the guild doesn't have a guild storage,
		// though this should never happen
		if (!dm && !this._client.storage.guilds.has(message.guild.id)) return false;

		// Don't bother with anything else if author is blacklisted
		if (await this._isBlacklisted(message.author, message, dm)) return false;

		const lang: string = await Lang.getLangFromMessage(message);
		const res: ResourceProxy = Lang.createResourceProxy(lang);

		type CommandCallData = [boolean, Command | null, string, string | null];
		let [commandWasCalled, command, prefix, name]: CommandCallData =
			await Util.wasCommandCalled(message);

		if (!commandWasCalled)
		{
			// Handle shortcuts
			if (!dm)
			{
				const shortcuts: { [name: string]: string } =
					await message.guild.storage!.settings.get('shortcuts') || {};

				if (shortcuts && prefix && name && shortcuts[name])
				{
					const shortcutName: string = name;
					const shortcutCall: RegExp = new RegExp(`^${Util.escape(prefix)} *${Util.escape(name)}`);
					const oldArgsStr: string = message.content.replace(shortcutCall, '');
					const newCommand: string = `${prefix}${shortcuts[name]}`;

					message.content = newCommand;
					[commandWasCalled, command, prefix, name] = await Util.wasCommandCalled(message);

					const shortcutArgs: string[] = this._client.argsParser(oldArgsStr, command!, message);
					message.content = format(newCommand, ...shortcutArgs);

					if (!commandWasCalled)
						message.channel.send(res.DISPATCHER_ERR_INVALID_SHORTCUT({ name: shortcutName }));
				}
			}

			// Send unknownCommandError in DMs
			if (dm && this._client.unknownCommandError)
				message.channel.send(this._unknownCommandError(res));

			// Emit an `unknownCommand` event and return if no
			// command or shortcut was called
			if (!commandWasCalled)
			{
				if (name)
				{
					const unknownCall: RegExp = new RegExp(`^${Util.escape(prefix || '')} *${Util.escape(name)}`);
					const unknownArgsStr: string = message.content.replace(unknownCall, '');
					const unknownCommandArgs: any[] = this._client.argsParser(unknownArgsStr);
					this._client.emit('unknownCommand', name, unknownCommandArgs, message);
					return true;
				}

				return false;
			}
		}

		// Determine if the command call was valid, returning the error and exiting if not
		let validCall: boolean = false;
		try { validCall = await this._canCallCommand(res, command as Command, message, dm); }
		catch (err) { message.author.send(err); }
		if (!validCall) return true;

		// Remove clientuser from message.mentions if only mentioned one time as a prefix
		const clientMention: RegExp = new RegExp(`<@!?${this._client.user!.id}>`, 'g');
		const startsWithClientMention: RegExp = new RegExp(`^${clientMention.source}`);
		if (startsWithClientMention.test(message.content)
			&& (message.content.match(clientMention) || []).length === 1)
			message.mentions.users.delete(this._client.user!.id);

		// Prepare args
		const call: RegExp = new RegExp(`^${Util.escape(prefix)} *${Util.escape(name!)}`);
		const preppedInput: string = message.content.replace(call, '').trim();
		let args: string[] = this._client.argsParser(preppedInput, command!, message);

		type Result = string | MessageOptions | Message;
		type CommandResult = Result | Result[] | Promise<Result> | Promise<Result[]>;
		type MiddlewareResult = [Message, any[]] | Promise<[Message, any[]]> | string | Error;

		let commandResult!: CommandResult;
		let middlewarePassed: boolean = true;
		const middleware: MiddlewareFunction[] = this._client.middleware.concat(command!.middleware);

		// Function to send middleware result, utilizing compact mode if enabled
		const sendMiddlewareResult: (result: string, options?: MessageOptions) => Promise<any> =
			async (result, options) =>
			{
				if (await message.guild?.storage?.settings.get('compact') || this._client.compact)
				{
					if (message.reactions.cache.size > 0) await message.reactions.removeAll();
					return CompactModeHelper.registerButton(
						message,
						this._client.buttons.fail,
						async () => message.channel.send(result, options!)
					);
				}

				return message.channel.send(result);
			};

		// Run middleware
		for (const func of middleware)
			try
			{
				let result: MiddlewareResult = func.call(command, message, args);
				if (result instanceof Promise)
					result = await result;

				if (!(result instanceof Array))
				{
					if (typeof result === 'string')
						commandResult = await sendMiddlewareResult(result);

					middlewarePassed = false;
					break;
				}

				[message, args] = result;
			}
			catch (err)
			{
				commandResult = await sendMiddlewareResult(err.toString(), { split: true });
				middlewarePassed = false;
				break;
			}

		if (!middlewarePassed) return true;

		// Return an error if the command is locked
		if (!dm && this._isLocked(command!, message, args))
		{
			const currentLock: CommandLock = this._getCurrentLock(command!, message.guild);
			message.channel.send(currentLock.getError(lang, message, args));
			return true;
		}

		// Set up the command lock for this command if it exists
		const lock: CommandLock = command!.lock;
		let lockTimeout: NodeJS.Timer;
		if (!dm && lock)
		{
			Util.assignNestedValue(this._locks, [message.guild.id, command!.name], lock);
			lock.lock(message, args);
			if (command!.lockTimeout > 0)
				lockTimeout = this._client.setTimeout(() => lock.free(message, args), command!.lockTimeout);
		}

		// Run the command
		try { commandResult = await command!.action(message, args); }
		catch (err) { this._logger.error(`Dispatch:${command!.name}`, err.stack); }

		// Send command result to the channel if it's of a supported type
		if (commandResult !== null
			&& typeof commandResult !== 'undefined'
			&& !(commandResult instanceof Array)
			&& !(commandResult instanceof DMessage))
			commandResult = await message.channel.send(commandResult as string) as CommandResult;

		// commandResult = Util.flattenArray([<Message | Message[]> commandResult]);
		// TODO: Store command result information for command editing

		// Clean up the command lock after execution has finished
		if (!dm && lock)
		{
			Util.removeNestedValue(this._locks, [message.guild.id, command!.name]);
			if (lockTimeout!) this._client.clearTimeout(lockTimeout!);
			lock.free(message, args);
		}

		const dispatchEnd: number = Util.now() - dispatchStart;
		this._client.emit('command', command!.name, args, dispatchEnd, message);

		return true;
	}

	/**
	 * Return whether or not the given command is locked, either directly
	 * or as a sibling of another command
	 */
	private _isLocked(command: Command, message: Message, args: any): boolean
	{
		const lock: CommandLock = this._getCurrentLock(command, message.guild);
		return lock ? lock.isLocked(message, args) : false;
	}

	/**
	 * Return the lock that is preventing the command from being called.
	 * This can be the command's own lock, or the lock of another command
	 * that the given command is a sibling of
	 */
	private _getCurrentLock(command: Command, guild: Guild): CommandLock
	{
		const locks: { [command: string]: CommandLock } = this._locks[guild.id] || {};
		let lock: CommandLock = locks[command.name];
		if (lock) return lock;

		for (const commandName of Object.keys(locks))
			if (locks[commandName].siblings.includes(command.name))
				lock = locks[commandName];

		return lock;
	}

	/**
	 * Check if the calling user is blacklisted
	 */
	private async _isBlacklisted(user: User, message: Message, dm: boolean): Promise<boolean>
	{
		if (await this._client.storage.get(`blacklist.${user.id}`)) return true;
		if (!dm && await message.guild.storage!.settings.get(`blacklist.${user.id}`)) return true;
		return false;
	}

	/**
	 * Return whether or not the command is allowed to be called based
	 * on whatever circumstances are present at call-time, throwing
	 * appropriate errors as necessary for unsatisfied conditions
	 */
	private async _canCallCommand(res: ResourceProxy, command: Command, message: Message, dm: boolean): Promise<boolean>
	{
		const storage: GuildStorage | null = !dm ? this._client.storage.guilds.get(message.guild.id)! : null;

		if (command.ownerOnly && !this._client.isOwner(message.author)) return false;
		if (!dm && (await storage!.settings.get('disabledGroups') || []).includes(command.group)) return false;
		if (!this._passedRateLimiters(res, message, command)) return false;

		if (dm && command.guildOnly)
			throw this._guildOnlyError(res);

		const missingClientPermissions: PermissionResolvable[] = this._checkClientPermissions(command, message, dm);
		if (missingClientPermissions.length > 0)
		{
			// Explicitly send this error to the channel rather than throwing
			message.channel.send(this._missingClientPermissionsError(res, missingClientPermissions));
			return false;
		}

		const missingCallerPermissions: PermissionResolvable[] = this._checkCallerPermissions(command, message, dm);
		if (missingCallerPermissions.length > 0)
			throw this._missingCallerPermissionsError(res, missingCallerPermissions);

		if (!await this._passedRoleLimiter(command, message, dm))
			throw await this._failedLimiterError(res, command, message);

		if (!this._hasRoles(command, message, dm))
			throw this._missingRolesError(res, command);

		return true;
	}

	/**
	 * Return whether or not the message author passed global
	 * and command-specific ratelimits for the given command
	 */
	private _passedRateLimiters(res: ResourceProxy, message: Message, command: Command): boolean
	{
		const passedGlobal: boolean = !this._isRateLimited(res, message, command, true);
		const passedCommand: boolean = !this._isRateLimited(res, message, command);
		const passedAllLimiters: boolean = passedGlobal && passedCommand;

		if (passedAllLimiters)
		{
			const manager: RateLimitManager = this._client.rateLimitManager;
			const limit: string = command.ratelimit;
			const identifier: string = command.ratelimit ? command.name : 'global';
			const descriptors: string[] = [message.author.id, identifier];

			if (!(limit && !manager.call(limit, ...descriptors)) && this._client.ratelimit)
				manager.call(this._client.ratelimit, message.author.id, 'global');
		}

		return passedAllLimiters;
	}

	/**
	 * Check global or command-specific ratelimits for the given message
	 * author, notify them if they exceed ratelimits, and return whether
	 * or not the user is ratelimited
	 */
	private _isRateLimited(res: ResourceProxy, message: Message, command: Command, global: boolean = false): boolean
	{
		const manager: RateLimitManager = this._client.rateLimitManager;
		const limit: string = command.ratelimit || this._client.ratelimit;
		if (!limit) return false;

		const identifier: string = command.ratelimit ? !global ? command.name : 'global' : 'global';
		const descriptors: string[] = [message.author.id, identifier];
		const rateLimit: RateLimit = manager.get(limit, ...descriptors);
		if (!rateLimit.isLimited) return false;

		if (!rateLimit.wasNotified)
		{
			const globalLimitString: string = this._client.ratelimit;
			const globalLimit: RateLimit | null = globalLimitString
				? manager.get(globalLimitString, message.author.id, 'global')
				: null;
			if (globalLimit && globalLimit.isLimited && globalLimit.wasNotified) return true;

			type RateLimitErrorString = s.DISPATCHER_ERR_RATELIMIT_EXCEED_GLOBAL | s.DISPATCHER_ERR_RATELIMIT_EXCEED;
			const errStr: RateLimitErrorString = global
				? s.DISPATCHER_ERR_RATELIMIT_EXCEED_GLOBAL
				: s.DISPATCHER_ERR_RATELIMIT_EXCEED;

			rateLimit.setNotified();
			message.channel.send(res[errStr]({ time: Time.difference(rateLimit.expires, Date.now()).toString() }));
		}

		return true;
	}

	/**
	 * Return permissions the client is missing to execute the given command
	 */
	private _checkClientPermissions(command: Command, message: Message, dm: boolean): PermissionResolvable[]
	{
		return dm ? [] : command.clientPermissions.filter(a =>
			!(message.channel as TextChannel).permissionsFor(this._client.user!)!.has(a));
	}

	/**
	 * Return the permissions the caller is missing to call the given command
	 */
	private _checkCallerPermissions(command: Command, message: Message, dm: boolean): PermissionResolvable[]
	{
		return dm ? [] : command.callerPermissions.filter(a =>
			!(message.channel as TextChannel).permissionsFor(message.author)!.has(a));
	}

	/**
	 * Return whether or not the message author passes the role limiter
	 */
	private async _passedRoleLimiter(command: Command, message: Message, dm: boolean): Promise<boolean>
	{
		if (dm)
			return true;

		const storage: GuildStorage = this._client.storage.guilds.get(message.guild.id)!;
		const limitedCommands: { [name: string]: string[] } = await storage.settings.get('limitedCommands') || {};

		if (!limitedCommands[command.name])
			return true;

		if (limitedCommands[command.name].length === 0)
			return true;

		return message.member!.roles.cache.filter(role => limitedCommands[command.name].includes(role.id)).size > 0;
	}

	/**
	 * Return whether or not the user has one of the roles specified
	 * in the command's requisite roles
	 */
	private _hasRoles(command: Command, message: Message, dm: boolean): boolean
	{
		return dm
			|| command.roles.length === 0
			|| message.member!.roles.cache.filter(role =>
				command.roles.includes(role.name)).size > 0;
	}

	/**
	 * Return an error for unknown commands in DMs
	 */
	private _unknownCommandError(res: ResourceProxy): string
	{
		return res.DISPATCHER_ERR_UNKNOWN_COMMAND();
	}

	/**
	 * Return an error for guild only commands
	 */
	private _guildOnlyError(res: ResourceProxy): string
	{
		return res.DISPATCHER_ERR_GUILD_ONLY();
	}

	/**
	 * Return an error for missing caller permissions
	 */
	private _missingClientPermissionsError(res: ResourceProxy, missing: PermissionResolvable[]): string
	{
		return res.DISPATCHER_ERR_MISSING_CLIENT_PERMISSIONS({ missing: missing.join(', ') });
	}

	/**
	 * Return an error for missing caller permissions
	 */
	private _missingCallerPermissionsError(res: ResourceProxy, missing: PermissionResolvable[]): string
	{
		return res.DISPATCHER_ERR_MISSING_CALLER_PERMISSIONS({ missing: missing.join(', ') });
	}

	/**
	 * Return an error for failing a command limiter
	 */
	private async _failedLimiterError(res: ResourceProxy, command: Command, message: Message): Promise<string>
	{
		const storage: GuildStorage = this._client.storage.guilds.get(message.guild.id)!;
		const limitedCommands: { [name: string]: string[] } = await storage.settings.get('limitedCommands');
		const roles: string[] = message.guild.roles.cache
			.filter(r => limitedCommands[command.name].includes(r.id))
			.map(r => r.name);

		return res.DISPATCHER_ERR_MISSING_ROLES({ roles: roles.join(', ') });
	}

	/**
	 * Return an error for missing roles
	 */
	private _missingRolesError(res: ResourceProxy, command: Command): string
	{
		return res.DISPATCHER_ERR_MISSING_ROLES({ roles: command.roles.join(', ') });
	}
}
