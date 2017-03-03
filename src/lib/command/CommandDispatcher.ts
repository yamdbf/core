import { PermissionResolvable, TextChannel } from 'discord.js';
import { Message } from '../types/Message';
import { GuildStorage } from '../storage/GuildStorage';
import { Command } from '../command/Command';
import { Bot } from '../bot/Bot';
import * as now from 'performance-now';

/**
 * Handles dispatching commands
 * @private
 */
export class CommandDispatcher<T extends Bot>
{
	private _bot: T;
	public constructor(bot: T)
	{
		this._bot = bot;

		// Register message listener
		if (!this._bot.passive) this._bot.on('message', message => this.handleMessage(message));
	}

	/**
	 * Handle received messages
	 */
	private async handleMessage(message: Message): Promise<void>
	{
		const dispatchStart: number = now();
		if (this._bot.selfbot && message.author !== this._bot.user) return;
		if (message.author.bot) return;

		const dm: boolean = ['dm', 'group'].includes(message.channel.type);
		if (!dm) message.guild.storage = this._bot.guildStorages.get(message.guild);

		const [commandCalled, command, prefix, name]: [boolean, Command<T>, string, string] = this.isCommandCalled(message);
		if (!commandCalled) return;

		if (!(!dm && prefix === message.guild.storage.getSetting('prefix')) && prefix !== ''
			&& (message.content.match(new RegExp(`<@!?${this._bot.user.id}>`, 'g')) || []).length === 1)
			message.mentions.users.delete(this._bot.user.id);

		let validCaller: boolean = false;
		try { validCaller = this.testCommand(command, message); }
		catch (err) { message[this._bot.selfbot ? 'channel' : 'author'].send(err); }
		if (!validCaller) return;

		let args: string[] = message.content
			.replace(prefix, '').replace(name, '')
			.trim()
			.split(command.argOpts.separator)
			.map(a => a.trim())
			.filter(a => a !== '');

		let middlewarePassed: boolean = true;
		for (let middleware of command._middleware)
			try
			{
				let result: Promise<[Message, any[]]> | [Message, any[]] =
					middleware.call(command, message, args);
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

		this._bot.emit('command', command.name, args, dispatchEnd, message);
	}

	/**
	 * Return if a command has been called, the called command
	 * the prefix used to call the command, and the name or alias
	 * of the command used to call it
	 */
	private isCommandCalled(message: Message): [boolean, Command<T>, string, string]
	{
		const dm: boolean = ['dm', 'group'].includes(message.channel.type);
		const prefixes: string[] = [
			`<@${this._bot.user.id}>`,
			`<@!${this._bot.user.id}>`
		];

		if (!dm) prefixes.push(message.guild.storage.getSetting('prefix'));

		let prefix: string = prefixes.find(a => message.content.trim().startsWith(a));

		if (dm && !prefix) prefix = '';
		if (!prefix && !dm) return [false, null, null, null];

		const commandName: string = message.content.trim()
			.slice(prefix.length).trim()
			.split(' ')[0];

		const command: Command<T> = this._bot.commands.find(c =>
			c.name === commandName || c.aliases.includes(commandName));

		if (!command) return [false, null, null, null];
		return [true, command, prefix, commandName];
	}

	/**
	 * Test if the command caller is allowed to use the command
	 * under whatever circumstances are present at call-time
	 */
	private testCommand(command: Command<T>, message: Message): boolean
	{
		const config: any = this._bot.config;
		const dm: boolean = ['dm', 'group'].includes(message.channel.type);
		const storage: GuildStorage = !dm ? this._bot.guildStorages.get(message.guild) : null;

		if (!dm && storage.settingExists('disabledGroups')
			&& storage.getSetting('disabledGroups').includes(command.group)) return false;
		if (command.ownerOnly && !config.owner.includes(message.author.id)) return false;

		if (dm && command.guildOnly) throw this.guildOnlyError();
		let missingPermissions: PermissionResolvable[] = this.checkPermissions(command, message, dm);
		if (missingPermissions.length > 0) throw this.missingPermissionsError(missingPermissions);
		if (!this.checkLimiter(command, message, dm)) throw this.failedLimiterError(command, message);
		if (!this.hasRoles(command, message, dm)) throw this.missingRolesError(command);

		return true;
	}

	/** 
	 * Compare user permissions to the command's requisites
	 */
	private checkPermissions(command: Command<T>, message: Message, dm: boolean): PermissionResolvable[]
	{
		return this._bot.selfbot || dm ? [] : command.permissions.filter(a =>
			!(<TextChannel> message.channel).permissionsFor(message.author).hasPermission(a));
	}

	/**
	 * Compare user roles to the command's limiter
	 */
	private checkLimiter(command: Command<T>, message: Message, dm: boolean): boolean
	{
		if (dm || this._bot.selfbot) return true;
		let storage: GuildStorage = this._bot.guildStorages.get(message.guild);
		let limitedCommands: { [name: string]: string[] } = storage.getSetting('limitedCommands') || {};
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
		return this._bot.selfbot || command.roles.length === 0 || dm
			|| message.member.roles.filter(role =>
				command.roles.includes(role.name)).size > 0;
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
	private failedLimiterError(command: Command<T>, message: Message): string
	{
		const storage: GuildStorage = this._bot.guildStorages.get(message.guild);
		let limitedCommands: { [name: string]: string[] } = storage.getSetting('limitedCommands');
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
