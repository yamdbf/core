// Type definitions for yamdbf v2.5.7
// Project: https://github.com/zajrik/yamdbf
// License: MIT

declare module 'yamdbf'
{
	import { User, Guild as DGuild, Client, Message as DMessage, Collection, ClientOptions, PermissionResolvable } from 'discord.js';

	export const version: string;

	export class Bot extends Client
	{
		public constructor(botOptions: BotOptions, clientOptions?: ClientOptions);
		public name: string;
		public commandsDir: string;
		public statusText: string;
		public readyText: string;
		public noCommandErr: boolean;
		public selfbot: boolean;
		public passive: boolean;
		public version: string;
		public disableBase: string[];
		public config: any;

		public storage: LocalStorage;
		public guildStorages: GuildStorageRegistry<string, GuildStorage>;
		public commands: CommandRegistry<string, Command<any>>;

		private _token: string;
		private _guildDataStorage: LocalStorage;
		private _guildSettingStorage: LocalStorage;
		private _guildStorageLoader: GuildStorageLoader;
		private _commandLoader: CommandLoader;
		private _dispatcher: CommandDispatcher;

		public loadCommand(command: string): void;
		public start(): this;
		public setDefaultSetting(key: string, value: any): this;
		public removeDefaultSetting(key: string): this;
		public defaultSettingExists(key: string): boolean;
		public getPrefix(guild: string | Guild): string;
		public sweepStorages(): void;

		public on(event: string, listener: Function): this;
		public on(event: 'command', listener: (
			name: string,
			args: Array<number | string>,
			original: string, execTime: number,
			message: Message) => void): this;
	}

	type BotOptions = {
		name: string;
		token: string;
		commandsDir?: string;
		statusText?: string;
		readyText?: string;
		noCommandErr?: boolean;
		selfbot?: boolean;
		passive?: boolean;
		version?: string;
		disableBase?: string[];
		config: any;
	}

	export class Command<T extends Bot>
	{
		public constructor(bot: T, info: CommandInfo);
		public bot: T;
		public name: string;
		public description: string;
		public usage: string;
		public extraHelp: string;
		public group: string;
		public aliases: string[];
		public guildOnly: boolean;
		public argOpts: ArgOpts;
		public permissions: PermissionResolvable[];
		public roles: string[];
		public ownerOnly: boolean;
		public overloads: string;

		public action(message: Message,
						args: any[],
						mentions: User[],
						original: string): any;
		public register(): void;
		public use(fn: (message: Message, args: any[]) => [Message, any[]]): this;

		protected _respond(message: Message, response: string, code: string): Promise<Message>;
	}

	type CommandInfo = {
		name: string;
		description: string;
		usage: string;
		group: string;
		extraHelp?: string;
		aliases?: string[];
		guildOnly?: boolean;
		hidden?: boolean;
		argOpts?: ArgOpts;
		permissions?: PermissionResolvable[];
		roles?: string[];
		ownerOnly?: boolean;
		overloads?: string;
	}

	type ArgOpts = {
		separator?: string;
	}

	class CommandDispatcher<T extends Bot>
	{
		public constructor(bot: T);
		private _bot: T;

		private handleMessage(message: Message): Promise<any>;
		private isCommandCalled(message: Message): [boolean, Command<T>, string, string];
		private testCommand(command: Command<T>, message: Message): boolean;

		private checkPermissions(command: Command<T>, message: Message, dm: boolean): PermissionResolvable[];
		private checkLimiter(command: Command<T>, message: Message, dm: boolean)
		private hasRoles(command: Command<T>, message: Message, dm: boolean): boolean;

		// private commandNotFoundError(message: Message): Promise<Message>;
		private guildOnlyError(message: Message): Promise<Message>;
		private missingPermissionsError(missing: PermissionResolvable[], message: Message): Promise<Message>;
		private missingRolesError(message: Message, command: Command<T>): Promise<Message>;

		private dispatch(command: Command<T>, message: Message, args: any[]): Promise<any>;
	}

	export class CommandLoader
	{
		public constructor(bot: Bot);
		private _bot: Bot;

		public loadCommands(): void;
		public reloadCommand(): void;
	}

	export class CommandRegistry<K, V> extends Collection<K, V>
	{
		public groups: string[];

		public register(): void;
		public findByNameOrAlias(text: string): Command<Bot>;
		public filterGuildUsable(bot: Bot, message: Message): Collection<string, Command<Bot>>;
		public filterDMUsable(bot: Bot, message: Message): Collection<string, Command<Bot>>;
		public filterDMHelp(bot: Bot, message: Message): Collection<string, Command<Bot>>;
	}

	export class GuildStorage
	{
		public constructor(bot: Bot, guild: Guild | string, dataStorage: LocalStorage, settingsStorage: LocalStorage);
		private _id: string;
		private _dataStorage: LocalStorage;
		private _settingsStorage: LocalStorage;
		private _temp: Object;

		public id: string;

		public settingsLength: number;
		public settingsKeys: string[];

		public settingKey(index: number): string;
		public getSetting(key: string): any;
		public setSetting(key: string, value: any): void;
		public removeSetting(key: string): void;
		public settingExists(key: string): boolean;
		public resetSettings(defaults: DefaultGuildSettings): void;

		public length: number;
		public keys: string[];

		public key(index: number): string;
		public getItem(key: string): any;
		public setItem(key: string, value: any): void;
		public removeItem(key: string): void;
		public exists(key: string): boolean;
		public clear(): void;

		public queue(key: string, callback: Function): Promise<any>
		public nonConcurrentAccess(key: string, callback: Function): Promise<any>;
	}

	type DefaultGuildSettings = {
		prefix: string;
		disabledGroups: string[];
	}

	export class GuildStorageLoader
	{
		public constructor(bot: Bot);
		private _bot: Bot;

		public loadStorages(dataStorage: LocalStorage, settingsStorage: LocalStorage): void;
		public initNewGuilds(dataStorage: LocalStorage, settingsStorage: LocalStorage): void;
	}

	export class GuildStorageRegistry<K, V> extends Collection<K, V>
	{
		public get(guild: K): V;
		public get(guild: Guild): V;
		public findAll(key: keyof V, value: any): Collection<K, V>;
		public findAll(key: keyof V, value: any): any;
		public findAllBySetting(key: string, value: any): Collection<K, V>;
		public resetAllGuildSettings(defaults: DefaultGuildSettings): void;
	}

	export class LocalStorage
	{
		public constructor(fileName: string);
		public length: number;
		public keys: string[];

		public key(index: number): string;
		public getItem(key: string): any;
		public setItem(key: string, value: any): void;
		public removeItem(key: string): void;
		public exists(key: string): boolean;
		public clear(): void;

		public queue(key: string, callback: Function): Promise<any>
		public nonConcurrentAccess(key: string, callback: Function): Promise<any>;
	}

	export class Message extends DMessage
	{
		public guild: Guild;
	}

	export class Guild extends DGuild
	{
		public storage?: GuildStorage;
	}

	type ResolveArgTypes = 'String' | 'Number' | 'User' | 'Member' | 'BannedUser' | 'Channel' | 'Role';
	type ExpectArgTypes = 'String' | 'Number' | 'User' | 'Member' | 'Channel' | 'Role' | 'Any';
	export class Middleware {
		static resolveArgs(argTypes: { [name: string]: ResolveArgTypes }): (message: Message, args: any[]) => [Message, any[]];
		static expect(argTypes: { [name: string]: ExpectArgTypes }): (message: Message, args: any[]) => [Message, any[]];
	}
}
