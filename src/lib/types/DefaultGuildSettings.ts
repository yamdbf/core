export type DefaultGuildSettings = {
	[key: string]: any;
	prefix: string;
	disabledGroups: string[];
};

/**
 * @typedef {Object} DefaultGuildSettings - The default settings to apply to new guilds.
 * Stored under the key <code>'defaultGuildSettings'</code> in {@link Bot#storage}
 * @property {string} prefix='/' - Prefix to prepend commands
 * @property {Array} [disabledGroups=[]] - Command groups to ignore
 */
