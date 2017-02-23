'use babel';
'use strict';

import path from 'path';

import _Bot from './lib/bot/Bot';
import _GuildStorage from './lib/storage/GuildStorage';
import _GuildStorageLoader from './lib/storage/GuildStorageLoader';
import _GuildStorageRegistry from './lib/storage/GuildStorageRegistry';
import _LocalStorage from './lib/storage/LocalStorage';
import _Command from './lib/command/Command';
import _CommandLoader from './lib/command/CommandLoader';
import _CommandRegistry from './lib/command/CommandRegistry';
import _CommandDispatcher from './lib/command/CommandDispatcher';
import _Util from './lib/Util';

import _resolveArgs from './lib/command/middleware/ResolveArgs';
import _expect from './lib/command/middleware/Expect';

/** @exports Bot */
export const Bot = _Bot;
export default Bot;

/** @exports GuildStorage */
export const GuildStorage = _GuildStorage;

/** @exports GuildStorageLoader */
export const GuildStorageLoader = _GuildStorageLoader;

/** @exports GuildStorageRegistry */
export const GuildStorageRegistry = _GuildStorageRegistry;

/** @exports LocalStorage */
export const LocalStorage = _LocalStorage;

/** @exports Command */
export const Command = _Command;

/** @exports CommandLoader */
export const CommandLoader = _CommandLoader;

/** @exports CommandRegistry */
export const CommandRegistry = _CommandRegistry;

/** @exports CommandDispatcher */
export const CommandDispatcher = _CommandDispatcher;

/** @exports Util */
export const Util = _Util;

export const Middleware = { resolveArgs: _resolveArgs, expect: _expect };

/** @exports version */
export const version = require(path.join(__dirname, '..', 'package')).version;

/** @external {Client} See: {@link https://discord.js.org/#/docs/main/stable/class/Client} */
/** @external {ClientOptions} See: {@link https://discord.js.org/#/docs/main/stable/typedef/ClientOptions} */
/** @external {Collection} See: {@link https://discord.js.org/#/docs/main/stable/class/Collection} */
/** @external {Guild} See: {@link https://discord.js.org/#/docs/main/stable/class/Guild} */
/** @external {Message} See: {@link https://discord.js.org/#/docs/main/stable/class/Message} */
/** @external {User} See: {@link https://discord.js.org/#/docs/main/stable/class/User} */
/** @external {PermissionResolvable} See: {@link https://discord.js.org/#/docs/main/stable/typedef/PermissionResolvable} */
