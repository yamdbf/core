import { Collection } from 'discord.js';
import { RateLimit } from './RateLimit';
import { Time } from '../Time';
import { Message } from '../types/Message';

/**
 * Handles assigning ratelimits to guildmembers and users
 * @param {string} limit Ratelimit string matching the regex <code>\d+\/\d+[s|m|h|d]</code><br>
 * 						 <b>Example:</b> <code>1/10m</code> to limit a command to one use per 10 minutes
 * @param {boolean} global Whether or not this RateLimiter handles global ratelimits
 */
export class RateLimiter
{
	private _limit: [number, number];
	private _global: boolean;
	private _rateLimits: Collection<string, Collection<string, RateLimit>>;
	private _globalLimits: Collection<string, RateLimit>;
	public constructor(limit: string, global: boolean)
	{
		this._limit = this._parseLimit(limit);
		this._global = global;

		this._rateLimits = new Collection<string, Collection<string, RateLimit>>();
		this._globalLimits = new Collection<string, RateLimit>();
	}

	/**
	 * Returns the RateLimit object for the message author if global
	 * or message member if message is in a guild
	 * @param {external:Message} message Discord.js Message object
	 * @returns {RateLimit}
	 */
	public get(message: Message): RateLimit
	{
		if (this._isGlobal(message))
		{
			if (!this._globalLimits.has(message.author.id))
				this._globalLimits.set(message.author.id, new RateLimit(this._limit));
			return this._globalLimits.get(message.author.id);
		}
		else
		{
			if (!this._rateLimits.has(message.guild.id))
				this._rateLimits.set(message.guild.id, new Collection<string, RateLimit>());

			if (!this._rateLimits.get(message.guild.id).has(message.author.id))
				this._rateLimits.get(message.guild.id).set(message.author.id, new RateLimit(this._limit));

			return this._rateLimits.get(message.guild.id).get(message.author.id);
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
