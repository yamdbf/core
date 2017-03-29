import * as path from 'path';

export { Bot } from './lib/bot/Bot';
export { Command } from './lib/command/Command';
export { CommandDispatcher } from './lib/command/CommandDispatcher';
export { CommandLoader } from './lib/command/CommandLoader';
export { CommandRegistry } from './lib/command/CommandRegistry';
export { GuildSettings } from './lib/storage/GuildSettings';
export { GuildStorageLoader } from './lib/storage/GuildStorageLoader';
export { KeyedStorage } from './lib/storage/KeyedStorage';
export { Middleware } from './lib/command/middleware/Middleware';
export { RateLimit } from './lib/command/RateLimit';
export { RateLimiter } from './lib/command/RateLimiter';

export { StorageProvider } from './lib/storage/StorageProvider';
export { StorageFactory } from './lib/storage/StorageFactory';
export { JSONProvider } from './lib/storage/JSONProvider';

import * as CommandDecorators from './lib/command/CommandDecorators';
export { CommandDecorators }

export { Time } from './lib/Time';
export { Util } from './lib/Util';

export { ArgOpts } from './lib/types/ArgOpts';
export { BaseCommandName } from './lib/types/BaseCommandName';
export { BotOptions } from './lib/types/BotOptions';
export { ClientStorage } from './lib/types/ClientStorage';
export { CommandInfo } from './lib/types/CommandInfo';
export { DefaultGuildSettings } from './lib/types/DefaultGuildSettings';
export { Difference } from './lib/types/Difference';
export { ExpectArgType } from './lib/types/ExpectArgType';
export { Guild } from './lib/types/Guild';
export { GuildStorage } from './lib/types/GuildStorage';
export { Message } from './lib/types/Message';
export { MiddlewareFunction } from './lib/types/MiddlewareFunction';
export { ResolveArgType } from './lib/types/ResolveArgType';
export { StorageProviderConstructor } from './lib/types/StorageProviderConstructor';

export const version: string = require(path.join(__dirname, '..', 'package')).version;

/** @external {Client} See: {@link https://discord.js.org/#/docs/main/stable/class/Client} */
/** @external {ClientOptions} See: {@link https://discord.js.org/#/docs/main/stable/typedef/ClientOptions} */
/** @external {Collection} See: {@link https://discord.js.org/#/docs/main/stable/class/Collection} */
/** @external {Guild} See: {@link https://discord.js.org/#/docs/main/stable/class/Guild} */
/** @external {Message} See: {@link https://discord.js.org/#/docs/main/stable/class/Message} */
/** @external {User} See: {@link https://discord.js.org/#/docs/main/stable/class/User} */
/** @external {PermissionResolvable} See: {@link https://discord.js.org/#/docs/main/stable/typedef/PermissionResolvable} */
