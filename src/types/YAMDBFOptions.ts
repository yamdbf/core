/**
 * @typedef {Object} YAMDBFOptions Object containing required {@link Client} properties to be
 * passed to a Client on construction
 * @property {string} [token] Token needed to connect the Client to Discord
 * @property {string[]} [owner=[]] Can also be a single string<br>See: {@link Client#owner}
 * @property {StorageProviderConstructor} [provider] See: {@link Client#provider}
 * @property {string} [commandsDir] See: {@link Client#commandsDir}
 * @property {string} [localeDir] See: {@link Client#localeDir}
 * @property {string} [defaultLang] See: {@link Client#defaultLang}
 * @property {string} [statusText=null] See: {@link Client#statusText}
 * @property {string} [readyText='Client ready!'] See: {@link Client#readyText}
 * @property {boolean} [unknownCommandError=true] See: {@link Client#unknownCommandError}
 * @property {boolean} [dmHelp=true] See: {@link Client#dmHelp}
 * @property {boolean} [passive=false] See: {@link Client#passive}
 * @property {boolean} [pause=false] See: {@link Client#pause}
 * @property {string[]} [disableBase=[]] See: {@link Client#disableBase}
 * @property {string} [ratelimit] Sets a global rate limit on command calls for every user
 * @property {LogLevel} [logLevel] Sets the logging level for the logger. Defaults to `LogLevel.DEBUG`
 * @property {Array<PluginConstructor|string>} [plugins=[]] An array of Plugin classes (not instances)
 * 															or plugin package name strings to be loaded and used
 * @property {ResolverConstructor[]} [customResolvers=[]] An array of Resolver classes (not instances)
 * @property {Function} [argsParser] Function taking an input string, an optional {@link Command} object,
 * 									 and an optional {@link Message} object that returns an array of argument
 * 									 strings. Should be used instead of middleware for providing an
 * 									 alternative to the default args parsing of splitting input on the
 * 									 Command's specified argument separator
 * @property {object} [buttons] Object mapping keys for easy access to unicode emoji strings or custom
 * 								emoji id strings. To be used by the Client when compact mode is active<br>
 * 								See: {@link Client#buttons}
 * @property {boolean} [compact=false] Whether or not compact mode should be used
 * @property {boolean} [tsNode=false] Whether or not ts-node is being used, allowing the CommandLoader to
 * 									  attempt to load .ts files when loading Commands
 */

import { StorageProviderConstructor } from './StorageProviderConstructor';
import { PluginConstructor } from './PluginConstructor';
import { ResolverConstructor } from './ResolverConstructor';
import { BaseCommandName } from './BaseCommandName';
import { LogLevel } from './LogLevel';
import { Message } from './Message';
import { Command } from '../command/Command';

export type YAMDBFOptions = {
	token?: string;
	owner?: string | string[];
	provider?: StorageProviderConstructor;
	commandsDir?: string;
	localeDir?: string;
	defaultLang?: string;
	statusText?: string;
	readyText?: string;
	unknownCommandError?: boolean;
	dmHelp?: boolean;
	passive?: boolean;
	pause?: boolean;
	disableBase?: BaseCommandName[];
	ratelimit?: string;
	logLevel?: LogLevel;
	plugins?: (PluginConstructor | string)[];
	customResolvers?: ResolverConstructor[];
	argsParser?: (input: string, command?: Command, message?: Message) => string[];
	buttons?: { [key: string]: string };
	compact?: boolean;
	tsNode?: boolean;
};
