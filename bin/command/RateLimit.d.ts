/**
 * Maintains its own call count and expiry for making sure
 * things only happen a certain number of times within
 * a given timeframe
 * @param {Tuple<number, number>} limit Tuple containing quantity and duration
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
    private _reset();
    /**
     * Returns whether or not this rate limit has been capped out
     * for its current expiry window while incrementing calls
     * towards the rate limit cap if not currently capped
     * @returns {boolean}
     */
    call(): boolean;
    /**
     * Return whether or not this ratelimit is currently capped out
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
     * Whether or not this RateLimit was flagged after
     * notifying the user of being rate limited
     * @type {boolean}
     */
    readonly wasNotified: boolean;
    /**
     * Flag this RateLimit as having had the user the RateLimit
     * is for notified of being rate limited
     * @returns {void}
     */
    setNotified(): void;
}
