import { Collection, User } from 'discord.js';
import { RateLimit } from './RateLimit';
import { Time } from '../util/Time';
import { Message } from '../types/Message';

/**
 * Handles assigning ratelimits to guildmembers and users
 * @param {string} limit Ratelimit string matching the regex `\d+\/\d+[s|m|h|d]`<br>
 * 						 **Example:** `1/10m` to limit a command to one use per 10 minutes
 * @param {boolean} global Whether or not this RateLimiter handles global ratelimits
 */
export class RateLimiter
{
	private readonly _limit: [number, number];
	private readonly _global: boolean;
	private readonly _rateLimits: Collection<string, Collection<string, RateLimit>>;
	private readonly _globalLimits: Collection<string, RateLimit>;

	public constructor(limit: string, global: boolean)
	{
		this._limit = this._parseLimit(limit);
		this._global = global;

		this._rateLimits = new Collection<string, Collection<string, RateLimit>>();
		this._globalLimits = new Collection<string, RateLimit>();
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
	public get(message: Message, userOverride?: User): RateLimit
	{
		const user: User = userOverride ? userOverride : message.author;
		if (this._isGlobal(message))
		{
			if (!this._globalLimits.has(user.id))
				this._globalLimits.set(user.id, new RateLimit(this._limit));
			return this._globalLimits.get(user.id);
		}
		else
		{
			if (!this._rateLimits.has(message.guild.id))
				this._rateLimits.set(message.guild.id, new Collection<string, RateLimit>());

			if (!this._rateLimits.get(message.guild.id).has(user.id))
				this._rateLimits.get(message.guild.id).set(user.id, new RateLimit(this._limit));

			return this._rateLimits.get(message.guild.id).get(user.id);
		}
	}

	/**
	 * Parse the ratelimit from the given input string
	 * @private
	 */
	private _parseLimit(limitString: string): [number, number]
	{
		const limitRegex: RegExp = /^(\d+)\/(\d+)(s|m|h|d)?$/;
		if (!limitRegex.test(limitString)) throw new Error(`Failed to parse a ratelimit from '${limitString}'`);
		let [limit, duration, post]: (string | number)[] = limitRegex.exec(limitString).slice(1, 4);

		if (post) duration = Time.parseShorthand(duration + post);
		else duration = parseInt(duration);
		limit = parseInt(limit);

		return [limit, duration];
	}

	/**
	 * Determine whether or not to use the global rate limit collection
	 * @private
	 */
	private _isGlobal(message?: Message): boolean
	{
		return message ? message.channel.type !== 'text' || this._global : this._global;
	}
}
