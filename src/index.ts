import 'source-map-support/register';
import * as path from 'path';

export { Client } from './client/Client';
export { Plugin } from './client/Plugin';
export { IPlugin } from './client/interface/IPlugin';
export { PluginLoader } from './client/PluginLoader';
export { PluginConstructor } from './types/PluginConstructor';

export { Command } from './command/Command';
export { CommandDispatcher } from './command/CommandDispatcher';
export { CommandLoader } from './command/CommandLoader';
export { CommandRegistry } from './command/CommandRegistry';

export { GuildSettings } from './storage/GuildSettings';
export { GuildStorageLoader } from './storage/GuildStorageLoader';
export { KeyedStorage } from './storage/KeyedStorage';
export { SharedProviderStorage } from './storage/SharedProviderStorage';
export { Middleware } from './command/middleware/Middleware';
export { RateLimit } from './command/RateLimit';
export { RateLimiter } from './command/RateLimiter';

export { IStorageProvider } from './storage/interface/IStorageProvider';
export { StorageProvider } from './storage/StorageProvider';
export { StorageFactory } from './storage/StorageFactory';
export { Providers } from './storage/Providers';
export { Database } from './storage/Database';

import * as CommandDecorators from './command/CommandDecorators';
export { CommandDecorators };

export { Time } from './util/Time';
export { Util } from './util/Util';

export { Logger } from './util/logger/Logger';
export { logger } from './util/logger/LoggerDecorator';
export { Loggable, ILoggable } from './util/logger/Loggable';
export { LogLevel } from './types/LogLevel';
export { LogData } from './types/LogData';
export { TransportFunction } from './types/TransportFunction';
export { Transport } from './types/Transport';

export { Lang } from './localization/Lang';
export { BaseStrings } from './localization/BaseStrings';
export { ResourceLoader } from './types/ResourceLoader';

export { deprecated } from './util/DeprecatedDecorator';

export { ListenerUtil } from './util/ListenerUtil';

export { ArgOpts } from './types/ArgOpts';
export { BaseCommandName } from './types/BaseCommandName';
export { ClientStorage } from './types/ClientStorage';
export { CommandInfo } from './types/CommandInfo';
export { DefaultGuildSettings } from './types/DefaultGuildSettings';
export { Difference } from './types/Difference';
export { ExpectArgType } from './types/ExpectArgType';
export { Guild } from './types/Guild';
export { GuildStorage } from './types/GuildStorage';
export { Message } from './types/Message';
export { MiddlewareFunction } from './types/MiddlewareFunction';
export { ResolveArgType } from './types/ResolveArgType';
export { StorageProviderConstructor } from './types/StorageProviderConstructor';
export { YAMDBFOptions } from './types/YAMDBFOptions';

export const version: string = require(path.join(__dirname, '..', 'package')).version;

/** @external {Client} See: {@link https://discord.js.org/#/docs/main/stable/class/Client} */
/** @external {ClientOptions} See: {@link https://discord.js.org/#/docs/main/stable/typedef/ClientOptions} */
/** @external {Collection} See: {@link https://discord.js.org/#/docs/main/stable/class/Collection} */
/** @external {Guild} See: {@link https://discord.js.org/#/docs/main/stable/class/Guild} */
/** @external {Message} See: {@link https://discord.js.org/#/docs/main/stable/class/Message} */
/** @external {MessageOptions} See: {@link https://discord.js.org/#/docs/main/stable/typedef/MessageOptions} */
/** @external {PermissionResolvable} See: {@link https://discord.js.org/#/docs/main/stable/typedef/PermissionResolvable} */
/** @external {Role} See: {@link https://discord.js.org/#/docs/main/stable/class/Role} */
/** @external {User} See: {@link https://discord.js.org/#/docs/main/stable/class/User} */

/**
 * @typedef {Array<any>} Tuple Represents an array of fixed length where the the item in
 * the specified position is of the specified type.
 *
 * Example:
 * ```
 * ['foo', 10] === [string, number] === Tuple<string, number>
 * ```
 */
