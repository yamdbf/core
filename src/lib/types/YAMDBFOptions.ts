/**
 * @typedef {Object} YAMDBFOptions Object containing required {@link Client} properties to be
 * passed to a Client on construction
 * @property {string} [name='botname'] See: {@link Client#name}
 * @property {string} token See: {@link Client#token}
 * @property {string} [provider] See: {@link Client#provider}
 * @property {string} [commandsDir] See: {@link Client#commandsDir}
 * @property {string} [statusText=null] See: {@link Client#statusText}
 * @property {string} [readyText='Ready!'] See: {@link Client#readyText}
 * @property {boolean} [unknownCommandError=true] See: {@link Client#unknownCommandError}
 * @property {boolean} [selfbot=false] See: {@link Client#selfbot}
 * @property {boolean} [passive=false] see {@link Client#passive}
 * @property {string} [version='0.0.0'] See: {@link Client#version}
 * @property {Object} config See: {@link Client#config}
 * @property {string[]} [disableBase=[]] See: {@link Client#disableBase}
 * @property {string} [ratelimit] Sets a global rate limit on command calls for every user
 */

import { StorageProviderConstructor } from './StorageProviderConstructor';
import { BaseCommandName } from './BaseCommandName';

export type YAMDBFOptions = {
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
