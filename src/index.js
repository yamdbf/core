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

/** @exports version */
export const version = require(path.join(__dirname, '..', 'package')).version;

/** @external {Client} See: {@link http://hydrabolt.github.io/discord.js/#!/docs/tag/master/class/Client} */
/** @external {Collection} See: {@link http://hydrabolt.github.io/discord.js/#!/docs/tag/master/class/Collection} */
/** @external {Guild} See: {@link http://hydrabolt.github.io/discord.js/#!/docs/tag/master/class/Guild} */
/** @external {Message} See: {@link http://hydrabolt.github.io/discord.js/#!/docs/tag/master/class/Message} */
/** @external {User} See: {@link http://hydrabolt.github.io/discord.js/#!/docs/tag/master/class/User} */
/** @external {PermissionResolvable} See: {@link http://hydrabolt.github.io/discord.js/#!/docs/tag/master/typedef/PermissionResolvable} */
