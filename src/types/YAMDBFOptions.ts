/**
 * @typedef {Object} YAMDBFOptions Object containing required {@link Client} properties to be
 * passed to a Client on construction
 * @property {string} [name='botname'] See: {@link Client#name}
 * @property {string} token See: {@link Client#token}
 * @property {string[]} [owner=[]] Can also be a single string<br>See: {@link Client#owner}
 * @property {string} [provider] See: {@link Client#provider}
 * @property {string} [commandsDir] See: {@link Client#commandsDir}
 * @property {string} [localeDir] See: {@link Client#localeDir}
 * @property {string} [defaultLang] See: {@link Client#defaultLang}
 * @property {string} [statusText=null] See: {@link Client#statusText}
 * @property {string} [readyText='Client ready!'] See: {@link Client#readyText}
 * @property {boolean} [unknownCommandError=true] See: {@link Client#unknownCommandError}
 * @property {boolean} [selfbot=false] See: {@link Client#selfbot}
 * @property {boolean} [passive=false] See: {@link Client#passive}
 * @property {boolean} [pause=false] See: {@link Client#pause}
 * @property {string} [version='0.0.0'] See: {@link Client#version}
 * @property {string[]} [disableBase=[]] See: {@link Client#disableBase}
 * @property {string} [ratelimit] Sets a global rate limit on command calls for every user
 * @property {LogLevel} [logLevel] Sets the logging level for the logger. Defaults to `LogLevel.LOG`
 */

import { StorageProviderConstructor } from './StorageProviderConstructor';
import { BaseCommandName } from './BaseCommandName';
import { LogLevel } from './LogLevel';

export type YAMDBFOptions = {
	name: string;
	token: string;
	owner?: string | string[];
	provider?: StorageProviderConstructor;
	commandsDir?: string;
	localeDir?: string;
	defaultLang?: string;
	statusText?: string;
	readyText?: string;
	unknownCommandError?: boolean;
	selfbot?: boolean;
	passive?: boolean;
	pause?: boolean;
	version?: string;
	disableBase?: BaseCommandName[];
	ratelimit?: string;
	logLevel?: LogLevel;
};
