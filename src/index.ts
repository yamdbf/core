import * as path from 'path';

export { Bot } from './lib/bot/Bot';
export { Command } from './lib/command/Command';
export { CommandLoader } from './lib/command/CommandLoader';
export { CommandRegistry } from './lib/command/CommandRegistry';
export { CommandDispatcher } from './lib/command/CommandDispatcher';
export { GuildStorage } from './lib/storage/GuildStorage';
export { GuildStorageLoader } from './lib/storage/GuildStorageLoader';
export { GuildStorageRegistry } from './lib/storage/GuildStorageRegistry';
export { LocalStorage } from './lib/storage/LocalStorage';
export { Middleware } from './lib/command/middleware/Middleware';
export { Util } from './lib/Util';

export { ArgOpts } from './lib/types/ArgOpts';
export { BotOptions } from './lib/types/BotOptions';
export { CommandInfo } from './lib/types/CommandInfo';
export { DefaultGuildSettings } from './lib/types/DefaultGuildSettings';
export { ExpectArgType } from './lib/types/ExpectArgType';
export { Guild } from './lib/types/Guild';
export { Message } from './lib/types/Message';
export { ResolveArgType } from './lib/types/ResolveArgType';

export const version: string = require(path.join(__dirname, '..', 'package')).version;

/** @external {Client} See: {@link https://discord.js.org/#/docs/main/stable/class/Client} */
/** @external {ClientOptions} See: {@link https://discord.js.org/#/docs/main/stable/typedef/ClientOptions} */
/** @external {Collection} See: {@link https://discord.js.org/#/docs/main/stable/class/Collection} */
/** @external {Guild} See: {@link https://discord.js.org/#/docs/main/stable/class/Guild} */
/** @external {Message} See: {@link https://discord.js.org/#/docs/main/stable/class/Message} */
/** @external {User} See: {@link https://discord.js.org/#/docs/main/stable/class/User} */
/** @external {PermissionResolvable} See: {@link https://discord.js.org/#/docs/main/stable/typedef/PermissionResolvable} */
