"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Util_1 = require("../util/Util");
const RateLimit_1 = require("./RateLimit");
/**
 * Handles creation and retrieval of {@link RateLimit} objects for the given interval
 * and a given set of descriptors. Similar to {@link RateLimiter} but not designed around
 * Messages and Users. This simplifies the process of assigning ratelimits for any
 * arbitrary process/task
 */
class RateLimitManager {
    constructor() {
        this._ratelimits = {};
        setInterval(() => this._cleanup(this._ratelimits), 30e3);
    }
    /**
     * Get a {@link RateLimit} object for the given target descriptors. This can be
     * any arbitrary set of strings representing whatever you want. A good example
     * would be a RateLimit for a User within a Guild with 5 uses per minute:
     * ```
     * <RateLimitManager>.get('5/1m', guild.id, user.id);
     * ```
     * Or if you wanted to limit something in a DM for the specific User to 10
     * uses per 5 minutes:
     * ```
     * <RateLimitManager>.get('10/5m', user.id, 'DM');
     * ```
     * The possibilities are endless.<br><br>
     *
     * **Note:** The limit string counts as part of the descriptor. As such
     * ```
     * <RateLimitManager>.get('1/5m');
     * ```
     * is a valid descriptor, but keep in mind that every time you retrieve it, it
     * will be the same RateLimit instance, so if you need unique RateLimits for the
     * same limit/duration, you must create a unique descriptor
     * @param {string} limit Ratelimit string matching the regex `\d+\/\d+[s|m|h|d]`<br>
     * 						 **Example:** `1/10m` to create ratelimits of 1 per 10 minutes
     * @param {...string} descriptors RateLimit target descriptors
     * @returns {RateLimit}
     */
    get(limit, ...descriptors) {
        let rateLimit = Util_1.Util.getNestedValue(this._ratelimits, [...descriptors, limit]);
        if (rateLimit)
            return rateLimit;
        rateLimit = new RateLimit_1.RateLimit(Util_1.Util.parseRateLimit(limit));
        Util_1.Util.assignNestedValue(this._ratelimits, [...descriptors, limit], rateLimit);
        return rateLimit;
    }
    /**
     * Return the result of the {@link RateLimit#call} for the given
     * descriptors. See {@link RateLimitManager#get} for details on
     * fetching RateLimits via descriptors
     * @param {string} limit Ratelimit string matching the regex `\d+\/\d+[s|m|h|d]`<br>
     * 						 **Example:** `1/10m` to create ratelimits of 1 per 10 minutes
     * @param {...string} descriptors RateLimit target descriptors
     * @returns {boolean}
     */
    call(limit, ...descriptors) {
        return this.get(limit, ...descriptors).call();
    }
    /**
     * Recursively clean up expired ratelimits within the given target object
     * @private
     */
    async _cleanup(target) {
        for (const key of Object.keys(target))
            if (target[key] instanceof RateLimit_1.RateLimit) {
                const rateLimit = target[key];
                if ((Date.now() - rateLimit.expires) > (rateLimit.duration + 10e3))
                    delete target[key];
            }
            else if (Object.keys(target[key]).length === 0)
                delete target[key];
            else
                this._cleanup(target[key]);
    }
}
exports.RateLimitManager = RateLimitManager;

//# sourceMappingURL=RateLimitManager.js.map
