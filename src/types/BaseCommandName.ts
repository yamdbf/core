/**
 * @typedef {string} BaseCommandName String representing a name of a base command. Valid names are:
 * ```
 * 'blacklist',
 * 'whitelist',
 * 'clearlimit',
 * 'disablegroup',
 * 'enablegroup',
 * 'limit',
 * 'listgroups',
 * 'eval',
 * 'eval:ts',
 * 'help',
 * 'ping'
 * 'reload',
 * 'setprefix',
 * 'version'
 * ```
 */

export type BaseCommandName = 'blacklist'
	| 'whitelist'
	| 'clearlimit'
	| 'disablegroup'
	| 'enablegroup'
	| 'limit'
	| 'listgroups'
	| 'eval'
	| 'eval:ts'
	| 'help'
	| 'ping'
	| 'reload'
	| 'setprefix'
	| 'version';
