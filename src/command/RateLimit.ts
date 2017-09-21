/**
 * Maintains its own call count and expiry for making sure
 * things only happen a certain number of times within
 * a given timeframe
 * @param {Tuple<number, number>} limit Tuple containing quantity and duration
 */
export class RateLimit
{
	private readonly _limit: number;
	private readonly _duration: number;
	private _count: number;
	private _notified: boolean;

	public expires: number;

	public constructor(limit: [number, number])
	{
		[this._limit, this._duration] = limit;
		this._reset();
	}

	/**
	 * Sets this RateLimit to default values
	 * @private
	 */
	private _reset(): void
	{
		this._count = 0;
		this.expires = 0;
		this._notified = false;
	}

	/**
	 * Returns whether or not this rate limit has been capped out
	 * for its current expiry window while incrementing calls
	 * towards the rate limit cap if not currently capped
	 * @returns {boolean}
	 */
	public call(): boolean
	{
		if (this.expires < Date.now()) this._reset();
		if (this._count >= this._limit) return false;
		this._count++;
		if (this._count === 1) this.expires = Date.now() + this._duration;
		return true;
	}

	/**
	 * Return whether or not this ratelimit is currently capped out
	 * @returns {boolean}
	 */
	public get isLimited(): boolean
	{
		return (this._count >= this._limit) && (Date.now() < this.expires);
	}

	/**
	 * Flag this RateLimit as having had the user the RateLimit
	 * is for notified of being rate limited
	 * @returns {void}
	 */
	public setNotified(): void
	{
		this._notified = true;
	}

	/**
	 * Return whether or not this RateLimit was flagged after
	 * notifying the user of being rate limited
	 * @returns {boolean}
	 */
	public get wasNotified(): boolean
	{
		return this._notified;
	}
}
