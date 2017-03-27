import { BaseCommandName } from './BaseCommandName';
import { StorageProvider } from '../storage/StorageProvider';

export type BotOptions = {
	name: string;
	token: string;
	provider: new(name: string) => StorageProvider;
	commandsDir?: string;
	statusText?: string;
	readyText?: string;
	noCommandErr?: boolean;
	selfbot?: boolean;
	passive?: boolean;
	version?: string;
	disableBase?: BaseCommandName[];
	ratelimit?: string;
	config: any;
};

/**
 * @typedef {Object} BotOptions Object containing required {@link Bot} properties to be
 * passed to a Bot on construction
 * @property {string} [name='botname'] See: {@link Bot#name}
 * @property {string} token See: {@link Bot#token}
 * @property {string} provider See: {@link Bot#provider}
 * @property {string} [commandsDir] See: {@link Bot#commandsDir}
 * @property {string} [statusText=null] See: {@link Bot#statusText}
 * @property {string} [readyText='Ready!'] See: {@link Bot#readyText}
 * @property {boolean} [noCommandErr=true] See: {@link Bot#noCommandErr}
 * @property {boolean} [selfbot=false] See: {@link Bot#selfbot}
 * @property {boolean} [passive=false] see {@link Bot#passive}
 * @property {string} [version='0.0.0'] See: {@link Bot#version}
 * @property {Object} config See: {@link Bot#config}
 * @property {string[]} [disableBase=[]] See: {@link Bot#disableBase}
 * @property {string} [ratelimit] Sets a global rate limit on command calls for every user
 */
