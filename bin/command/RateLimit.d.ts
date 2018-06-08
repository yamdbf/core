/**
 * Maintains its own call count and expiry for making sure
 * things only happen a certain number of times within
 * a given timeframe
 * @param {Tuple<number, number>} limit Tuple containing limit and duration
 */
export declare class RateLimit {
    private _count;
    private _notified;
    readonly limit: number;
    readonly duration: number;
    expires: number;
    constructor(limit: [number, number]);
    /**
     * Sets this RateLimit to default values
     * @private
     */
    private _reset;
    /**
     * Returns whether or not this rate limit has been capped out
     * for its current expiry period while incrementing calls
     * towards the rate limit cap if not currently capped
     * @returns {boolean}
     */
    call(): boolean;
    /**
     * Return whether or not this ratelimit is currently capped out
     * for the current expiry period
     * @type {boolean}
     */
    readonly isLimited: boolean;
    /**
     * The remaining number of uses this RateLimit has for
     * this expiry period
     * @type {number}
     */
    readonly remaining: number;
    /**
     * Whether or not this RateLimit was flagged for having had
     * a notification given for being capped for this expiry period
     * @type {boolean}
     */
    readonly wasNotified: boolean;
    /**
     * Flag this RateLimit as having had a notification given
     * for being capped for this expiry period
     * @returns {void}
     */
    setNotified(): void;
}
