import { Guild } from 'discord.js';
import { StorageProvider } from './StorageProvider';
import { Util } from '../util/Util';
import { Client } from '../client/Client';

/**
 * Class containing asynchronous methods for storing, retrieving, and
 * interacting with settings for a specific guild. Will be contained
 * under {@link GuildStorage#settings}
 */
export class GuildSettings
{
	private readonly _provider: StorageProvider;
	private readonly _guild: Guild;
	private readonly _id: string;
	private readonly _client: any;
	private _cache: { [key: string]: any };
	public constructor(storage: StorageProvider, guild: Guild, client: Client)
	{
		this._provider = storage;
		this._guild = guild;
		this._id = guild.id;
		this._client = client;
		this._cache = {};
	}

	/**
	 * Initialize this storage instance
	 * @returns {Promise<void>}
	 */
	public async init(useDefaults: boolean = false): Promise<void>
	{
		try
		{
			let data: any = await this._provider.get(this._id);
			if (typeof data === 'undefined')
			{
				data = {};
				await this._provider.set(this._id, JSON.stringify(data));
			}
			else data = JSON.parse(data);

			if (useDefaults)
			{
				const defaults: any = await this._client.storage.get('defaultGuildSettings');
				for (const key of Object.keys(defaults))
					if (typeof data[key] === 'undefined')
						data[key] = defaults[key];

				await this._provider.set(this._id, JSON.stringify(data));
			}

			this._cache = data;
		}
		catch (err)
		{
			console.error(err.stack);
		}
	}

	/**
	 * Get the names of all keys in this storage for this Guild
	 * @returns {Promise<string[]>}
	 */
	public async keys(): Promise<string[]>
	{
		return Object.keys(this._cache);
	}

	/**
	 * Get a value from storage for this Guild
	 * @param {string} key The key in storage to get
	 * @returns {Promise<any>}
	 */
	public async get(key: string): Promise<any>
	{
		if (typeof key === 'undefined') throw new TypeError('Key must be provided');
		if (typeof key !== 'string') throw new TypeError('Key must be a string');

		if (key.includes('.'))
		{
			let path: string[] = key.split('.');
			return Util.getNestedValue(this._cache[path.shift()], path);
		}
		else
		{
			return this._cache[key];
		}
	}

	/**
	 * Set a value in storage for this Guild
	 * @param {string} key The key in storage to set
	 * @param {any} value The value to set
	 * @returns {Promise<void>}
	 */
	public async set(key: string, value: any): Promise<void>
	{
		if (typeof key === 'undefined') throw new TypeError('Key must be provided');
		if (typeof key !== 'string') throw new TypeError('Key must be a string');

		try { JSON.stringify(value); }
		catch (err) { value = {}; }

		if (key.includes('.'))
		{
			let path: string[] = key.split('.');
			let first: string = path.shift();
			if (typeof this._cache[first] === 'undefined')
				this._cache[first] = {};
			Util.assignNestedValue(this._cache[first], path, value);
		}
		else
		{
			this._cache[key] = value;
		}
		await this._provider.set(this._id, JSON.stringify(this._cache));
	}

	/**
	 * Remove a value from storage for this Guild
	 * @param {string} key The key in storage to remove
	 * @returns {Promise<void>}
	 */
	public async remove(key: string): Promise<void>
	{
		if (typeof key === 'undefined') throw new TypeError('Key must be provided');
		if (typeof key !== 'string') throw new TypeError('Key must be a string');

		if (key.includes('.'))
		{
			let path: string[] = key.split('.');
			let first: string = path.shift();
			if (typeof this._cache[first] !== 'undefined')
				Util.removeNestedValue(this._cache[first], path);
		}
		else
		{
			delete this._cache[key];
		}
		await this._provider.set(this._id, JSON.stringify(this._cache));
	}

	/**
	 * Remove all key/value pairs from storage for this Guild
	 * @returns {Promise<void>}
	 */
	public async clear(): Promise<void>
	{
		this._cache = {};
		await this._provider.set(this._id, JSON.stringify(this._cache));
	}
}
