"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../Command");
const CommandDecorators_1 = require("../CommandDecorators");
const Middleware_1 = require("../middleware/Middleware");
const discord_js_1 = require("discord.js");
const { resolve, expect, localize } = Middleware_1.Middleware;
class default_1 extends Command_1.Command {
    constructor() {
        super({
            name: 'shortcuts',
            desc: 'Configure or list command shortcuts',
            usage: `<prefix>shortcuts ['get'|'set'|'remove'] [name] [...content]`,
            info: `Shortcuts allow creating and calling preconfigured command+argument sets, or simple aliases

Example:
	<prefix>shortcuts set h help

Which would set the shortcut "h" to call the command "help"


Shortcuts also allow substitution tokens for argument interpolation.

Example:
	<prefix>shortcuts set add eval %s + %s

Which would set the shortcut "add", to add two numbers --
"<prefix>add 2 3", which becomes "<prefix>eval 2 + 3"

Of course the eval command is owner-only, but this should give you an idea of how shortcuts work`,
            callerPermissions: ['ADMINISTRATOR']
        });
    }
    async action(message, [res, action, name, content]) {
        if (!action)
            return this.listShortcuts(message, res);
        else if (action === 'set')
            return this.setShortcut(message, res, name, content);
        else if (action === 'get')
            return this.getShortcut(message, res, name);
        else if (action === 'remove')
            return this.removeShortcut(message, res, name);
    }
    /**
     * List command shortcuts
     */
    async listShortcuts(message, res) {
        const shortcuts = await message.guild.storage.settings.get('shortcuts') || {};
        const names = Object.keys(shortcuts);
        let output;
        if (names.length === 0)
            output = res.CMD_SHORTCUTS_ERR_NO_SHORTCUTS();
        else
            output = res.CMD_SHORTCUTS_LIST({ names: names.join(', ') });
        this.respond(message, output);
    }
    /**
     * Set command shortcut content
     */
    async setShortcut(message, res, name, content) {
        const shortcuts = await message.guild.storage.settings.get('shortcuts') || {};
        if (Object.keys(shortcuts).length >= 50)
            return this.respond(message, res.CMD_SHORTCUTS_ERR_MAX_SHORTCUTS());
        if (content.length > 500)
            return this.respond(message, res.CMD_SHORTCUTS_ERR_SET_LENGTH());
        await message.guild.storage.settings.set(`shortcuts.${name}`, content);
        content = discord_js_1.Util.escapeMarkdown(content, true);
        return this.respond(message, res.CMD_SHORTCUTS_SET_SUCCESS({ name, content }));
    }
    /**
     * Get command shortcut content
     */
    async getShortcut(message, res, name) {
        const shortcuts = await message.guild.storage.settings.get('shortcuts') || {};
        if (!shortcuts[name])
            return this.respond(message, res.CMD_SHORTCUTS_ERR_MISSING({ name }));
        const content = discord_js_1.Util.escapeMarkdown(shortcuts[name], true);
        return this.respond(message, res.CMD_SHORTCUTS_GET_CONTENT({ name, content }));
    }
    /**
     * Remove a command shortcut
     */
    async removeShortcut(message, res, name) {
        const shortcuts = await message.guild.storage.settings.get('shortcuts') || {};
        if (!shortcuts[name])
            return this.respond(message, res.CMD_SHORTCUTS_ERR_MISSING({ name }));
        await message.guild.storage.settings.remove(`shortcuts.${name}`);
        return this.respond(message, res.CMD_SHORTCUTS_REMOVE_SUCCESS({ name }));
    }
}
__decorate([
    CommandDecorators_1.using(resolve(`action: ['get', 'set', 'remove'], name: String, ...content: String`)),
    CommandDecorators_1.using(function (message, args) {
        if (args[0]) {
            if (args[0] === 'set')
                return expect(`action: ['get', 'set', 'remove'], name: String, ...content: String`)
                    .call(this, message, args);
            else
                return expect(`action: ['get', 'set', 'remove'], name: String`)
                    .call(this, message, args);
        }
        else
            return [message, args];
    }),
    CommandDecorators_1.using(localize)
], default_1.prototype, "action", null);
exports.default = default_1;

//# sourceMappingURL=Shortcuts.js.map
