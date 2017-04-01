/**
 * @typedef {Object} BotOptions Object containing required {@link Bot} properties to be
 * passed to a Bot on construction
 * @property {string} [name='botname'] See: {@link Bot#name}
 * @property {string} token See: {@link Bot#token}
 * @property {string} [provider] See: {@link Bot#provider}
 * @property {string} [commandsDir] See: {@link Bot#commandsDir}
 * @property {string} [statusText=null] See: {@link Bot#statusText}
 * @property {string} [readyText='Ready!'] See: {@link Bot#readyText}
 * @property {boolean} [unknownCommandError=true] See: {@link Bot#unknownCommandError}
 * @property {boolean} [selfbot=false] See: {@link Bot#selfbot}
 * @property {boolean} [passive=false] see {@link Bot#passive}
 * @property {string} [version='0.0.0'] See: {@link Bot#version}
 * @property {Object} config See: {@link Bot#config}
 * @property {string[]} [disableBase=[]] See: {@link Bot#disableBase}
 * @property {string} [ratelimit] Sets a global rate limit on command calls for every user
 */

import { StorageProviderConstructor } from './StorageProviderConstructor';
import { BaseCommandName } from './BaseCommandName';

export type BotOptions = {
	name: string;
	token: string;
	provider?: StorageProviderConstructor;
	commandsDir?: string;
	statusText?: string;
	readyText?: string;
	unknownCommandError?: boolean;
	selfbot?: boolean;
	passive?: boolean;
	version?: string;
	disableBase?: BaseCommandName[];
	ratelimit?: string;
	config: any;
};
