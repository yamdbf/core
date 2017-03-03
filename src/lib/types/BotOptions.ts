export type BotOptions = {
	name: string;
	token: string;
	commandsDir?: string;
	statusText?: string;
	readyText?: string;
	noCommandErr?: boolean;
	selfbot?: boolean;
	passive?: boolean;
	version?: string;
	disableBase?: string[];
	config: any;
}

/**
 * @typedef {Object} BotOptions Object containing required {@link Bot} properties to be
 * passed to a Bot on construction
 * @property {string} [name='botname'] - See: {@link Bot#name}
 * @property {string} token - See: {@link Bot#token}
 * @property {string} [commandsDir] - See: {@link Bot#commandsDir}
 * @property {string} [statusText=null] - See: {@link Bot#statusText}
 * @property {string} [readyText='Ready!'] - See: {@link Bot#readyText}
 * @property {boolean} [noCommandErr=true] - See: {@link Bot#noCommandErr}
 * @property {boolean} [selfbot=false] - See: {@link Bot#selfbot}
 * @property {boolean} [passive=false] - see {@link Bot#passive}
 * @property {string} [version='0.0.0'] - See: {@link Bot#version}
 * @property {Object} config - See: {@link Bot#config}
 * @property {string[]} [disableBase=[]] - See: {@link Bot#disableBase}
 */
