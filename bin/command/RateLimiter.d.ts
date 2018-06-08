import { User } from 'discord.js';
import { RateLimit } from './RateLimit';
import { Message } from '../types/Message';
/**
 * Handles assigning ratelimits to guildmembers and users
 * @deprecated Will be removed in a future release. Use {@link RateLimitManager} instead
 * @param {string} limit Ratelimit string matching the regex `\d+\/\d+[s|m|h|d]`<br>
 * 						 **Example:** `1/10m` to limit a command to one use per 10 minutes
 * @param {boolean} global Whether or not this RateLimiter handles global ratelimits
 */
export declare class RateLimiter {
    private readonly _limit;
    private readonly _global;
    private readonly _rateLimits;
    private readonly _globalLimits;
    constructor(limit: string, global: boolean);
    /**
     * Returns the RateLimit object for the message author if global
     * or message member if message is in a guild. If a userOverride
     * is given then the RateLimit or global RateLimit will be
     * retrieved for that user based on the message location
     * @param {external:Message} message Discord.js Message object
     * @param {external:User} userOverride User object to use in place of Message author
     * @returns {RateLimit}
     */
    get(message: Message, userOverride?: User): RateLimit;
    /**
     * Determine whether or not to use the global rate limit collection
     * @private
     */
    private _isGlobal;
}
