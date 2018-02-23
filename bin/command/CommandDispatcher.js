"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const BaseStrings_1 = require("../localization/BaseStrings");
const Logger_1 = require("../util/logger/Logger");
const Time_1 = require("../util/Time");
const Lang_1 = require("../localization/Lang");
const Util_1 = require("../util/Util");
const util_1 = require("util");
/**
 * Handles dispatching commands
 * @private
 */
class CommandDispatcher {
    constructor(client) {
        this._ready = false;
        this._client = client;
        if (!this._client.passive)
            this._client.on('message', message => { if (this._ready)
                this.handleMessage(message); });
    }
    /**
     * Set the dispatcher as ready to receive and dispatch commands
     */
    setReady() {
        this._ready = true;
    }
    /**
     * Handle received messages
     */
    async handleMessage(message) {
        const dispatchStart = Util_1.Util.now();
        const dm = message.channel.type !== 'text';
        // Don't continue for bots and don't continue
        // for other users when the client is a selfbot
        if (message.author.bot)
            return;
        if (this._client.selfbot && message.author.id !== this._client.user.id)
            return;
        // Set `message.guild.storage` if message is not a DM
        if (!dm)
            message.guild.storage = this._client.storage.guilds.get(message.guild.id);
        // Don't bother with anything else if author is blacklisted
        if (await this.isBlacklisted(message.author, message, dm))
            return;
        const lang = dm
            ? this._client.defaultLang
            : await message.guild.storage.settings.get('lang')
                || this._client.defaultLang;
        const res = Lang_1.Lang.createResourceLoader(lang);
        let [commandWasCalled, command, prefix, name] = await Util_1.Util.wasCommandCalled(message);
        if (!commandWasCalled) {
            // Handle shortcuts
            if (!dm) {
                let shortcuts = await message.guild.storage.settings.get('shortcuts') || {};
                if (shortcuts && prefix && name && shortcuts[name]) {
                    const shortcutName = name;
                    const call = new RegExp(`^${Util_1.Util.escape(prefix)} *${name}`);
                    const oldArgsStr = message.content.replace(call, '');
                    const newCommand = `${prefix}${shortcuts[name]}`;
                    message.content = newCommand;
                    [commandWasCalled, command, prefix, name] = await Util_1.Util.wasCommandCalled(message);
                    const shortcutArgs = this._client.argsParser(oldArgsStr, command, message);
                    message.content = util_1.format(newCommand, ...shortcutArgs);
                    if (!commandWasCalled)
                        message.channel.send(res(BaseStrings_1.BaseStrings.DISPATCHER_ERR_INVALID_SHORTCUT, { name: shortcutName }));
                }
            }
            // Send unknownCommandError in DMs
            if (dm && this._client.unknownCommandError)
                message.channel.send(this.unknownCommandError(res));
            if (!commandWasCalled)
                return;
        }
        let validCall = false;
        try {
            validCall = await this.canCallCommand(res, command, message, dm);
        }
        catch (err) {
            message[this._client.selfbot ? 'channel' : 'author'].send(err);
        }
        if (!validCall)
            return;
        // Remove clientuser from message.mentions if only mentioned one time as a prefix
        const clientMention = new RegExp(`<@!?${this._client.user.id}>`, 'g');
        const startsWithClientMention = new RegExp(`^${clientMention.source}`);
        if (startsWithClientMention.test(message.content)
            && (message.content.match(clientMention) || []).length === 1)
            message.mentions.users.delete(this._client.user.id);
        // Prepare args
        const preppedInput = message.content.replace(prefix, '').replace(name, '').trim();
        let args = this._client.argsParser(preppedInput, command, message);
        let commandResult;
        let middlewarePassed = true;
        let middleware = this._client._middleware.concat(command._middleware);
        for (let func of middleware)
            try {
                let result = func.call(command, message, args);
                if (result instanceof Promise)
                    result = await result;
                if (!(result instanceof Array)) {
                    if (typeof result === 'string')
                        commandResult = await message.channel.send(result);
                    middlewarePassed = false;
                    break;
                }
                [message, args] = result;
            }
            catch (err) {
                commandResult = await message.channel.send(err.toString(), { split: true });
                middlewarePassed = false;
                break;
            }
        if (!middlewarePassed)
            return;
        try {
            commandResult = await command.action(message, args);
        }
        catch (err) {
            this._logger.error(`Dispatch:${command.name}`, err.stack);
        }
        if (commandResult !== null
            && typeof commandResult !== 'undefined'
            && !(commandResult instanceof Array)
            && !(commandResult instanceof discord_js_1.Message))
            commandResult = await message.channel.send(commandResult);
        // commandResult = Util.flattenArray([<Message | Message[]> commandResult]);
        // TODO: Store command result information for command editing
        const dispatchEnd = Util_1.Util.now() - dispatchStart;
        this._client.emit('command', command.name, args, dispatchEnd, message);
    }
    /**
     * Check if the calling user is blacklisted
     */
    async isBlacklisted(user, message, dm) {
        if (await this._client.storage.get(`blacklist.${user.id}`))
            return true;
        if (!dm && await message.guild.storage.settings.get(`blacklist.${user.id}`))
            return true;
        return false;
    }
    /**
     * Return whether or not the command is allowed to be called based
     * on whatever circumstances are present at call-time, throwing
     * appropriate errors as necessary for unsatisfied conditions
     */
    async canCallCommand(res, command, message, dm) {
        const storage = !dm ? this._client.storage.guilds.get(message.guild.id) : null;
        if (command.ownerOnly && !this._client.isOwner(message.author))
            return false;
        if (!dm && (await storage.settings.get('disabledGroups') || []).includes(command.group))
            return false;
        if (!this.passedRateLimiters(res, message, command))
            return false;
        if (dm && command.guildOnly)
            throw this.guildOnlyError(res);
        const missingClientPermissions = this.checkClientPermissions(command, message, dm);
        if (missingClientPermissions.length > 0) {
            // Explicitly send this error to the channel rather than throwing
            message.channel.send(this.missingClientPermissionsError(res, missingClientPermissions));
            return false;
        }
        const missingCallerPermissions = this.checkCallerPermissions(command, message, dm);
        if (missingCallerPermissions.length > 0)
            throw this.missingCallerPermissionsError(res, missingCallerPermissions);
        if (!(await this.passedRoleLimiter(command, message, dm)))
            throw await this.failedLimiterError(res, command, message);
        if (!this.hasRoles(command, message, dm))
            throw this.missingRolesError(res, command);
        return true;
    }
    /**
     * Return whether or not the message author passed global
     * and command-specific ratelimits for the given command
     */
    passedRateLimiters(res, message, command) {
        const passedGlobal = !this.isRateLimited(res, message, command, true);
        const passedCommand = !this.isRateLimited(res, message, command);
        const passedAllLimiters = passedGlobal && passedCommand;
        if (passedAllLimiters) {
            const manager = this._client.rateLimitManager;
            const limit = command.ratelimit;
            const identifier = command.ratelimit ? command.name : 'global';
            const descriptors = [message.author.id, identifier];
            if (!(limit && !manager.call(limit, ...descriptors)) && this._client.ratelimit)
                manager.call(this._client.ratelimit, message.author.id, 'global');
        }
        return passedAllLimiters;
    }
    /**
     * Check global or command-specific ratelimits for the given message
     * author, notify them if they exceed ratelimits, and return whether
     * or not the user is ratelimited
     */
    isRateLimited(res, message, command, global = false) {
        const manager = this._client.rateLimitManager;
        const limit = command.ratelimit || this._client.ratelimit;
        if (!limit)
            return false;
        const identifier = command.ratelimit ? !global ? command.name : 'global' : 'global';
        const descriptors = [message.author.id, identifier];
        const rateLimit = manager.get(limit, ...descriptors);
        if (!rateLimit.isLimited)
            return false;
        if (!rateLimit.wasNotified) {
            const globalLimitString = this._client.ratelimit;
            const globalLimit = globalLimitString
                ? manager.get(globalLimitString, message.author.id, 'global')
                : null;
            if (globalLimit && globalLimit.isLimited && globalLimit.wasNotified)
                return true;
            rateLimit.setNotified();
            message.channel.send(res(global
                ? BaseStrings_1.BaseStrings.DISPATCHER_ERR_RATELIMIT_EXCEED_GLOBAL
                : BaseStrings_1.BaseStrings.DISPATCHER_ERR_RATELIMIT_EXCEED, { time: Time_1.Time.difference(rateLimit.expires, Date.now()).toString() }));
        }
        return true;
    }
    /**
     * Return permissions the client is missing to execute the given command
     */
    checkClientPermissions(command, message, dm) {
        return dm ? [] : command.clientPermissions.filter(a => !message.channel.permissionsFor(this._client.user).has(a));
    }
    /**
     * Return the permissions the caller is missing to call the given command
     */
    checkCallerPermissions(command, message, dm) {
        return this._client.selfbot || dm ? [] : command.callerPermissions.filter(a => !message.channel.permissionsFor(message.author).has(a));
    }
    /**
     * Return whether or not the message author passes the role limiter
     */
    async passedRoleLimiter(command, message, dm) {
        if (dm || this._client.selfbot)
            return true;
        const storage = this._client.storage.guilds.get(message.guild.id);
        const limitedCommands = await storage.settings.get('limitedCommands') || {};
        if (!limitedCommands[command.name])
            return true;
        if (limitedCommands[command.name].length === 0)
            return true;
        return message.member.roles.filter(role => limitedCommands[command.name].includes(role.id)).size > 0;
    }
    /**
     * Return whether or not the user has one of the roles specified
     * in the command's requisite roles
     */
    hasRoles(command, message, dm) {
        return this._client.selfbot || command.roles.length === 0 || dm
            || message.member.roles.filter(role => command.roles.includes(role.name)).size > 0;
    }
    /**
     * Return an error for unknown commands in DMs
     */
    unknownCommandError(res) {
        return res(BaseStrings_1.BaseStrings.DISPATCHER_ERR_UNKNOWN_COMMAND);
    }
    /**
     * Return an error for guild only commands
     */
    guildOnlyError(res) {
        return res(BaseStrings_1.BaseStrings.DISPATCHER_ERR_GUILD_ONLY);
    }
    /**
     * Return an error for missing caller permissions
     */
    missingClientPermissionsError(res, missing) {
        return res(BaseStrings_1.BaseStrings.DISPATCHER_ERR_MISSING_CLIENT_PERMISSIONS, { missing: missing.join(', ') });
    }
    /**
     * Return an error for missing caller permissions
     */
    missingCallerPermissionsError(res, missing) {
        return res(BaseStrings_1.BaseStrings.DISPATCHER_ERR_MISSING_CALLER_PERMISSIONS, { missing: missing.join(', ') });
    }
    /**
     * Return an error for failing a command limiter
     */
    async failedLimiterError(res, command, message) {
        const storage = this._client.storage.guilds.get(message.guild.id);
        const limitedCommands = await storage.settings.get('limitedCommands');
        const roles = message.guild.roles
            .filter(r => limitedCommands[command.name].includes(r.id))
            .map(r => r.name);
        return res(BaseStrings_1.BaseStrings.DISPATCHER_ERR_MISSING_ROLES, { roles: roles.join(', ') });
    }
    /**
     * Return an error for missing roles
     */
    missingRolesError(res, command) {
        return res(BaseStrings_1.BaseStrings.DISPATCHER_ERR_MISSING_ROLES, { roles: command.roles.join(', ') });
    }
}
__decorate([
    Logger_1.logger
], CommandDispatcher.prototype, "_logger", void 0);
exports.CommandDispatcher = CommandDispatcher;

//# sourceMappingURL=CommandDispatcher.js.map
