/**
 * @typedef {string} BaseCommandName String representing a name of a base command. Valid names are:<br>
 * <pre class="prettyprint"><code>'blacklist',
 * 'whitelist',
 * 'clearlimit',
 * 'disablegroup',
 * 'enablegroup',
 * 'limit',
 * 'listgroups',
 * 'eval',
 * 'help',
 * 'ping'
 * 'reload',
 * 'setprefix',
 * 'version'</code></pre>
 */

export type BaseCommandName = 'blacklist'
	| 'whitelist'
	| 'clearlimit'
	| 'disablegroup'
	| 'enablegroup'
	| 'limit'
	| 'listgroups'
	| 'eval'
	| 'help'
	| 'ping'
	| 'reload'
	| 'setprefix'
	| 'version';
