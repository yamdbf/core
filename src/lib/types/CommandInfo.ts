import { PermissionResolvable } from 'discord.js';
import { ArgOpts } from './ArgOpts';

export type CommandInfo = {
	name: string;
	description: string;
	usage: string;
	group: string;
	extraHelp?: string;
	aliases?: string[];
	guildOnly?: boolean;
	hidden?: boolean;
	argOpts?: ArgOpts;
	permissions?: PermissionResolvable[];
	roles?: string[];
	ownerOnly?: boolean;
	overloads?: string;
}

/**
 * @typedef {Object} CommandInfo - Object containing required {@link Command} properties
 * to be passed to a Command on construction
 * @property {string} name - See: {@link Command#name}
 * @property {string} description - See: {@link Command#description}
 * @property {string} usage - See: {@link Command#usage}
 * @property {string} extraHelp - See: {@link Command#extraHelp}
 * @property {string} group - See: {@link Command#group}
 * @property {string[]} [aliases=[]] - See: {@link Command#aliases}
 * @property {boolean} [guildOnly=false] - See: {@link Command#guildOnly}
 * @property {boolean} [hidden=false] - See: {@link Command#hidden}
 * @property {ArgOpts} [argOpts] - See: {@link Command#argOpts}, {@link ArgOpts}
 * @property {PermissionResolvable[]} [permissions=[]] - See: {@link Command#permissions}
 * @property {string[]} [roles=[]] - See: {@link Command#roles}
 * @property {boolean} [ownerOnly=false] - See: {@link Command#ownerOnly}
 * @property {string} [overloads=null] - See: {@link Command#overloads}
 */
