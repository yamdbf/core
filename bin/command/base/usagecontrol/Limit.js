"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const Command_1 = require("../../Command");
const Middleware_1 = require("../../middleware/Middleware");
const CommandDecorators_1 = require("../../CommandDecorators");
const { expect, resolve, localize } = Middleware_1.Middleware;
class default_1 extends Command_1.Command {
    constructor() {
        super({
            name: 'limit',
            desc: 'Limit commands to certain roles',
            usage: `<prefix>limit <command> <roles, ...> | <prefix>limit <'clear'> <command>`,
            info: `Multiple roles can be passed to the command as a comma-separated list.

If a role is unable to be found and you know it exists, it could be that there are multiple roles containing the given role name search text. Consider refining your search, or using an @mention for the role you want to use.

Limiting a command will add the given roles to set of roles the command is limited to.

Use '<prefix>limit clear <command>' to clear all of the roles a command is limited to.

Removing individual roles is not possible to keep the command simple to use.`,
            callerPermissions: ['ADMINISTRATOR']
        });
    }
    async action(message, [res, clearOrCommand, rolesOrCommand]) {
        if (clearOrCommand === 'clear')
            return this.clearLimit(message, res, rolesOrCommand);
        else
            return this.limitCommand(message, res, clearOrCommand, rolesOrCommand);
    }
    /**
     * Clear all roles limiting the given command
     */
    async clearLimit(message, res, command) {
        await message.guild.storage.settings.remove(`limitedCommands.${command.name}`);
        return this.respond(message, res.CMD_LIMIT_CLEAR_SUCCESS({ commandName: command.name }));
    }
    /**
     * Add the given roles to the limiter for the given command
     */
    async limitCommand(message, res, command, roles) {
        if (command.group === 'base')
            return this.respond(message, res.CMD_LIMIT_ERR_INVALID_GROUP());
        const roleResolver = this.client.resolvers.get('Role');
        const roleStrings = roles.split(/ *, */).filter(r => r !== '' && r !== ',');
        const foundRoles = [];
        const invalidRoles = [];
        for (const roleString of roleStrings) {
            const role = await roleResolver.resolveRaw(roleString, message);
            if (!role || role instanceof discord_js_1.Collection)
                invalidRoles.push(roleString);
            else
                foundRoles.push(role);
        }
        if (invalidRoles.length > 0)
            message.channel
                .send(res.CMD_LIMIT_ERR_INVALID_ROLE({ invalidRoles: invalidRoles.map(r => `\`${r}\``).join(', ') }));
        if (foundRoles.length === 0)
            return this.respond(message, res.CMD_LIMIT_ERR_NO_ROLES());
        const storage = message.guild.storage;
        const newLimit = new Set(await storage.settings.get(`limitedCommands.${command.name}`) || []);
        for (const role of foundRoles)
            newLimit.add(role.id);
        await storage.settings.set(`limitedCommands.${command.name}`, Array.from(newLimit));
        return this.respond(message, res.CMD_LIMIT_SUCCESS({
            roles: foundRoles.map(r => `\`${r.name}\``).join(', '),
            commandName: command.name
        }));
    }
}
__decorate([
    CommandDecorators_1.using(function (message, args) {
        if (args[0] === 'clear')
            return resolve(`clear: String, command: Command`)
                .call(this, message, args);
        else
            return resolve(`command: Command, ...roles: String`)
                .call(this, message, args);
    }),
    CommandDecorators_1.using(function (message, args) {
        if (args[0] === 'clear')
            return expect(`clear: String, command: Command`)
                .call(this, message, args);
        else
            return expect(`command: Command, ...roles: String`)
                .call(this, message, args);
    }),
    CommandDecorators_1.using(localize)
], default_1.prototype, "action", null);
exports.default = default_1;

//# sourceMappingURL=Limit.js.map
