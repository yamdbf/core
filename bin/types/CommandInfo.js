"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });

//# sourceMappingURL=CommandInfo.js.map
