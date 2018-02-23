"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Maintains its own call count and expiry for making sure
 * things only happen a certain number of times within
 * a given timeframe
 * @param {Tuple<number, number>} limit Tuple containing quantity and duration
 */
class RateLimit {
    constructor(limit) {
        /**
         * The number of times this RateLimit can be
         * called within its duration
         * @type {number}
         */
        this.limit = limit[0];
        /**
         * The time from first call until reset
         * @type {number}
         */
        this.duration = limit[1];
        this._reset();
    }
    /**
     * Sets this RateLimit to default values
     * @private
     */
    _reset() {
        this.expires = 0;
        this._count = 0;
        this._notified = false;
    }
    /**
     * Returns whether or not this rate limit has been capped out
     * for its current expiry window while incrementing calls
     * towards the rate limit cap if not currently capped
     * @returns {boolean}
     */
    call() {
        if (this.expires < Date.now())
            this._reset();
        if (this._count >= this.limit)
            return false;
        this._count++;
        if (this._count === 1)
            this.expires = Date.now() + this.duration;
        return true;
    }
    /**
     * Return whether or not this ratelimit is currently capped out
     * @type {boolean}
     */
    get isLimited() {
        return (this._count >= this.limit) && (Date.now() < this.expires);
    }
    /**
     * The remaining number of uses this RateLimit has for
     * this expiry period
     * @type {number}
     */
    get remaining() {
        return (((this.limit - this._count) === 0) && !this.isLimited)
            ? this.limit
            : this.limit - this._count;
    }
    /**
     * Whether or not this RateLimit was flagged after
     * notifying the user of being rate limited
     * @type {boolean}
     */
    get wasNotified() {
        return this._notified;
    }
    /**
     * Flag this RateLimit as having had the user the RateLimit
     * is for notified of being rate limited
     * @returns {void}
     */
    setNotified() {
        this._notified = true;
    }
}
exports.RateLimit = RateLimit;

//# sourceMappingURL=RateLimit.js.map
