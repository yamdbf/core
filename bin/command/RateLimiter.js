"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const RateLimit_1 = require("./RateLimit");
const Util_1 = require("../util/Util");
const DeprecatedClassDecorator_1 = require("../util/DeprecatedClassDecorator");
/**
 * Handles assigning ratelimits to guildmembers and users
 * @deprecated Will be removed in a future release. Use {@link RateLimitManager} instead
 * @param {string} limit Ratelimit string matching the regex `\d+\/\d+[s|m|h|d]`<br>
 * 						 **Example:** `1/10m` to limit a command to one use per 10 minutes
 * @param {boolean} global Whether or not this RateLimiter handles global ratelimits
 */
let RateLimiter = class RateLimiter {
    constructor(limit, global) {
        this._limit = Util_1.Util.parseRateLimit(limit);
        this._global = global;
        this._rateLimits = new discord_js_1.Collection();
        this._globalLimits = new discord_js_1.Collection();
    }
    /**
     * Returns the RateLimit object for the message author if global
     * or message member if message is in a guild. If a userOverride
     * is given then the RateLimit or global RateLimit will be
     * retrieved for that user based on the message location
     * @param {external:Message} message Discord.js Message object
     * @param {external:User} userOverride User object to use in place of Message author
     * @returns {RateLimit}
     */
    get(message, userOverride) {
        const user = userOverride ? userOverride : message.author;
        if (this._isGlobal(message)) {
            if (!this._globalLimits.has(user.id))
                this._globalLimits.set(user.id, new RateLimit_1.RateLimit(this._limit));
            return this._globalLimits.get(user.id);
        }
        else {
            if (!this._rateLimits.has(message.guild.id))
                this._rateLimits.set(message.guild.id, new discord_js_1.Collection());
            if (!this._rateLimits.get(message.guild.id).has(user.id))
                this._rateLimits.get(message.guild.id).set(user.id, new RateLimit_1.RateLimit(this._limit));
            return this._rateLimits.get(message.guild.id).get(user.id);
        }
    }
    /**
     * Determine whether or not to use the global rate limit collection
     * @private
     */
    _isGlobal(message) {
        return message ? message.channel.type !== 'text' || this._global : this._global;
    }
};
RateLimiter = __decorate([
    DeprecatedClassDecorator_1.deprecatedClass('Class `RateLimiter` is deprecated. Use `RateLimitManager` instead')
], RateLimiter);
exports.RateLimiter = RateLimiter;

//# sourceMappingURL=RateLimiter.js.map
