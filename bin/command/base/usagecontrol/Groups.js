"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../Command");
const CommandDecorators_1 = require("../../CommandDecorators");
const Middleware_1 = require("../../middleware/Middleware");
const Lang_1 = require("../../../localization/Lang");
const { resolve, expect, localize } = Middleware_1.Middleware;
class default_1 extends Command_1.Command {
    constructor() {
        super({
            name: 'groups',
            desc: 'Configure or list command groups',
            usage: `<prefix>groups ['enable'|'on'|'disable'|'off'] [...group]`,
            info: `A '*' denotes a disabled group when listing all command groups.`,
            callerPermissions: ['ADMINISTRATOR']
        });
    }
    async action(message, [res, action, group]) {
        if (!action)
            return this.listGroups(message, res);
        else if (['enable', 'on'].includes(action))
            return this.enableGroup(message, res, group);
        else if (['disable', 'off'].includes(action))
            return this.disableGroup(message, res, group);
    }
    /**
     * List command groups
     */
    async listGroups(message, res) {
        const lang = await message.guild.storage.settings.get('lang') || this.client.defaultLang;
        const info = this.client.commands.groups.map(g => Lang_1.Lang.getGroupInfo(g, lang));
        const disabledGroups = await message.guild.storage.settings.get('disabledGroups') || [];
        const output = res.CMD_GROUPS_LIST({
            groups: this.client.commands.groups,
            disabledGroups,
            info
        });
        this.respond(message, output);
    }
    /**
     * Enable a command group
     */
    async enableGroup(message, res, group) {
        const err = {
            NO_EXIST: res.CMD_GROUPS_ERR_NOEXIST({ group }),
            ENABLED: res.CMD_GROUPS_ERR_ENABLED({ group })
        };
        if (!this.client.commands.groups.includes(group))
            return this.respond(message, err.NO_EXIST);
        const disabledGroups = await message.guild.storage.settings.get('disabledGroups') || [];
        if (group === 'base' || !disabledGroups.includes(group))
            return this.respond(message, err.ENABLED);
        disabledGroups.splice(disabledGroups.indexOf(group), 1);
        await message.guild.storage.settings.set('disabledGroups', disabledGroups);
        this.respond(message, res.CMD_GROUPS_ENABLE_SUCCESS({ group }));
    }
    /**
     * Disable a command group
     */
    async disableGroup(message, res, group) {
        const err = {
            NO_EXIST: res.CMD_GROUPS_ERR_NOEXIST({ group }),
            DISABLED: res.CMD_GROUPS_ERR_DISABLED({ group })
        };
        if (!this.client.commands.groups.includes(group))
            return this.respond(message, err.NO_EXIST);
        const disabledGroups = await message.guild.storage.settings.get('disabledGroups') || [];
        if (group === 'base' || disabledGroups.includes(group))
            return this.respond(message, err.DISABLED);
        disabledGroups.push(group);
        await message.guild.storage.settings.set('disabledGroups', disabledGroups);
        this.respond(message, res.CMD_GROUPS_DISABLE_SUCCESS({ group }));
    }
}
__decorate([
    CommandDecorators_1.using(resolve(`action: ['enable', 'on', 'disable', 'off'], ...group: String`)),
    CommandDecorators_1.using(function (message, args) {
        if (args[0])
            return expect(`action: ['enable', 'on', 'disable', 'off'], ...group: String`)
                .call(this, message, args);
        else
            return [message, args];
    }),
    CommandDecorators_1.using(localize)
], default_1.prototype, "action", null);
exports.default = default_1;

//# sourceMappingURL=Groups.js.map
