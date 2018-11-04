/**
 * @typedef {Object} CommandInfo - Object containing required {@link Command} properties
 * to be passed to a Command on construction
 * @property {string} name See: {@link Command#name}
 * @property {string} desc See: {@link Command#desc}
 * @property {string} usage See: {@link Command#usage}
 * @property {string} [info] See: {@link Command#info}
 * @property {string} [group='base'] See: {@link Command#group}
 * @property {string[]} [aliases=[]] See: {@link Command#aliases}
 * @property {boolean} [guildOnly=false] See: {@link Command#guildOnly}
 * @property {boolean} [hidden=false] See: {@link Command#hidden}
 * @property {ArgOpts} [argOpts] See: {@link Command#argOpts}, {@link ArgOpts}
 * @property {PermissionResolvable[]} [callerPermissions=[]] See: {@link Command#callerPermissions}
 * @property {PermissionResolvable[]} [clientPermissions=[]] See: {@link Command#clientPermissions}
 * @property {string[]} [roles=[]] See: {@link Command#roles}
 * @property {boolean} [ownerOnly=false] See: {@link Command#ownerOnly}
 * @property {string} [ratelimit] Sets a rate limit on calls to this command for every user
 * @property {number} [lockTimeout=30000] The time until command locks will expire automatically
 */
import { PermissionResolvable } from 'discord.js';
import { ArgOpts } from './ArgOpts';
export declare type CommandInfo = {
    name: string;
    desc: string;
    usage: string;
    group?: string;
    info?: string;
    aliases?: string[];
    guildOnly?: boolean;
    hidden?: boolean;
    argOpts?: ArgOpts;
    callerPermissions?: PermissionResolvable[];
    clientPermissions?: PermissionResolvable[];
    roles?: string[];
    ownerOnly?: boolean;
    ratelimit?: string;
    lockTimeout?: number;
};
