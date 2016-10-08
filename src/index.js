'use babel';
'use strict';

import _Bot from './lib/bot/Bot';
import _GuildStorage from './lib/storage/GuildStorage';
import _GuildStorageLoader from './lib/storage/GuildStorageLoader';
import _GuildStorageRegistry from './lib/storage/GuildStorageRegistry';
import _LocalStorage from './lib/storage/LocalStorage';
import _Command from './lib/command/Command';
import _CommandLoader from './lib/command/CommandLoader';
import _CommandRegistry from './lib/command/CommandRegistry';
import _CommandDispatcher from './lib/command/CommandDispatcher';

export const Bot = _Bot;
export const GuildStorage = _GuildStorage;
export const GuildStorageLoader = _GuildStorageLoader;
export const GuildStorageRegistry = _GuildStorageRegistry;
export const LocalStorage = _LocalStorage;
export const Command = _Command;
export const CommandLoader = _CommandLoader;
export const CommandRegistry = _CommandRegistry;
export const CommandDispatcher = _CommandDispatcher;

/** @external {Collection} See: {@link http://hydrabolt.github.io/discord.js/#!/docs/tag/master/class/Collection} */
/** @external {Guild} See: {@link http://hydrabolt.github.io/discord.js/#!/docs/tag/master/class/Guild} */
/** @external {Message} See: {@link http://hydrabolt.github.io/discord.js/#!/docs/tag/master/class/Message} */
/** @external {User} See: {@link http://hydrabolt.github.io/discord.js/#!/docs/tag/master/class/User} */
/** @external {PermissionResolvable} See: {@link http://hydrabolt.github.io/discord.js/#!/docs/tag/master/typedef/PermissionResolvable} */
