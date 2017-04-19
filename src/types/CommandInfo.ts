/**
 * @typedef {Object} CommandInfo - Object containing required {@link Command} properties
 * to be passed to a Command on construction
 * @property {string} name See: {@link Command#name}
 * @property {string} description See: {@link Command#description}
 * @property {string} usage See: {@link Command#usage}
 * @property {string} [extraHelp] See: {@link Command#extraHelp}
 * @property {string} [group='base'] See: {@link Command#group}
 * @property {string[]} [aliases=[]] See: {@link Command#aliases}
 * @property {boolean} [guildOnly=false] See: {@link Command#guildOnly}
 * @property {boolean} [hidden=false] See: {@link Command#hidden}
 * @property {ArgOpts} [argOpts] See: {@link Command#argOpts}, {@link ArgOpts}
 * @property {PermissionResolvable[]} [callerPermissions=[]] See: {@link Command#callerPermissions}
 * @property {PermissionResolvable[]} [clientPermissions=[]] See: {@link Command#clientPermissions}
 * @property {string[]} [roles=[]] See: {@link Command#roles}
 * @property {boolean} [ownerOnly=false] See: {@link Command#ownerOnly}
 * @property {string} [overloads=null] See: {@link Command#overloads}
 * @property {string} [ratelimit] Sets a rate limit on calls to this command for every user
 */

import { PermissionResolvable } from 'discord.js';
import { BaseCommandName } from './BaseCommandName';
import { ArgOpts } from './ArgOpts';

export type CommandInfo = {
	name: string;
	description: string;
	usage: string;
	group?: string;
	extraHelp?: string;
	aliases?: string[];
	guildOnly?: boolean;
	hidden?: boolean;
	argOpts?: ArgOpts;
	callerPermissions?: PermissionResolvable[];
	clientPermissions?: PermissionResolvable[];
	roles?: string[];
	ownerOnly?: boolean;
	overloads?: BaseCommandName;
	ratelimit?: string;
};
