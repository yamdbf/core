/**
 * @typedef {Object} DefaultGuildSettings - The default settings to apply to new guilds.
 * Stored under the key `'defaultGuildSettings'` in {@link Client#storage}
 * @property {string} prefix='/' Prefix denoting a command call
 * @property {string[]} [disabledGroups=[]] Command groups to ignore
 */

export type DefaultGuildSettings = {
	[key: string]: any;
	prefix: string;
	disabledGroups: string[];
};
