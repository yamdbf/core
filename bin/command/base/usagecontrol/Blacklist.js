"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../Command");
const Middleware_1 = require("../../middleware/Middleware");
const CommandDecorators_1 = require("../../CommandDecorators");
const { resolve, expect, localize } = Middleware_1.Middleware;
class default_1 extends Command_1.Command {
    constructor() {
        super({
            name: 'blacklist',
            desc: 'Blacklist a user from calling commands',
            aliases: ['bl'],
            usage: `<prefix>blacklist <action> <user> ['global']`,
            info: 'If global, this will block the user from calling commands in ANY server and DMs',
            callerPermissions: ['ADMINISTRATOR']
        });
    }
    async action(message, [res, action, user, global]) {
        if (action === 'add') {
            if (user.id === message.author.id)
                return message.channel.send(res.CMD_BLACKLIST_ERR_NOSELF());
            if (user.bot)
                return message.channel.send(res.CMD_BLACKLIST_ERR_NOBOT());
            if (global === 'global') {
                if (!this.client.isOwner(message.author))
                    return message.channel.send(res.CMD_BLACKLIST_ERR_OWNERONLY());
                const globalBlacklist = await this.client.storage.get('blacklist') || {};
                if (globalBlacklist[user.id])
                    return message.channel.send(res.CMD_BLACKLIST_ERR_ALREADYGLOBAL());
                await this.client.storage.set(`blacklist.${user.id}`, true);
                this.client.emit('blacklistAdd', user, true);
                return message.channel.send(res.CMD_BLACKLIST_GLOBALSUCCESS({ user: user.tag }));
            }
            let member;
            try {
                member = message.guild.members.get(user.id) || await message.guild.members.fetch(user);
            }
            catch (err) { }
            if (member && member.permissions.has('ADMINISTRATOR'))
                return message.channel.send(res.CMD_BLACKLIST_ERR_BADTARGET());
            const guildBlacklist = await message.guild.storage.settings.get('blacklist') || {};
            if (guildBlacklist[user.id])
                return message.channel.send(res.CMD_BLACKLIST_ERR_ALREADYBLACKLISTED());
            await message.guild.storage.settings.set(`blacklist.${user.id}`, true);
            this.client.emit('blacklistAdd', user, false);
            return message.channel.send(res.CMD_BLACKLIST_SUCCESS({ user: user.tag }));
        }
        else if (action === 'remove') {
            if (global === 'global') {
                if (!this.client.isOwner(message.author))
                    return message.channel.send(res.CMD_WHITELIST_ERR_OWNERONLY());
                const globalBlacklist = await this.client.storage.get('blacklist') || {};
                if (!globalBlacklist[user.id])
                    return message.channel.send(res.CMD_WHITELIST_ERR_NOTGLOBAL());
                await this.client.storage.remove(`blacklist.${user.id}`);
                this.client.emit('blacklistRemove', user, true);
                return message.channel.send(res.CMD_WHITELIST_GLOBALSUCCESS({ user: user.tag }));
            }
            const guildBlacklist = await message.guild.storage.settings.get('blacklist') || {};
            if (!guildBlacklist[user.id])
                return message.channel.send(res.CMD_WHITELIST_ERR_NOTBLACKLISTED());
            await message.guild.storage.settings.remove(`blacklist.${user.id}`);
            this.client.emit('blacklistRemove', user, false);
            return message.channel.send(res.CMD_WHITELIST_SUCCESS({ user: user.tag }));
        }
    }
}
__decorate([
    CommandDecorators_1.using(resolve(`action: ['add', 'remove'], user: User`)),
    CommandDecorators_1.using(expect(`action: ['add', 'remove'], user: User`)),
    CommandDecorators_1.using(localize)
], default_1.prototype, "action", null);
exports.default = default_1;

//# sourceMappingURL=Blacklist.js.map
