import { StorageProvider } from './StorageProvider';
import { Util } from '../util/Util';
import { Logger } from '../util/logger/Logger';

/**
 * Simple async key/value storage abstraction operating on top
 * of a single key within the given StorageProvider instance.
 * As the name suggests, the given StorageProvider instance
 * can be shared between multiple SharedProviderStorage instances
 *
 * >Supports nested object paths in get/set/remove using `.`
 * like normal object accessors
 *
 * >**Note:** The storage provider given to the constructor should
 * already be initialized via its `init()` method
 */
export class SharedProviderStorage
{
	protected readonly _provider: StorageProvider;
	protected readonly _key: string;
	protected _cache: { [key: string]: any };

	public constructor(storage: StorageProvider, key: string)
	{
		this._provider = storage;
		this._key = key;
		this._cache = {};
	}

	/**
	 * Initialize this storage instance
	 * @returns {Promise<void>}
	 */
	public async init(): Promise<void>
	{
		try
		{
			let data: any = await this._provider.get(this._key);
			if (typeof data === 'undefined')
			{
				data = {};
				await this._provider.set(this._key, JSON.stringify(data));
			}
			else data = JSON.parse(data);

			this._cache = data;
		}
		catch (err) { Logger.instance().error('SharedProviderStorage', err.stack); }
	}

	/**
	 * Get the names of all keys in this storage for this instance
	 * @returns {Promise<string[]>}
	 */
	public async keys(): Promise<string[]>
	{
		return Object.keys(this._cache);
	}

	/**
	 * Get a value from storage for this instance
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
			return Util.getNestedValue(this._cache[path.shift()!], path);
		}
		else return this._cache[key];
	}

	/**
	 * Check if a value exists in storage for this instance
	 * @param {string} key The key in storage to check
	 * @returns {Promise<boolean>}
	 */
	public async exists(key: string): Promise<boolean>
	{
		return typeof await this.get(key) !== 'undefined';
	}

	/**
	 * Set a value in storage for this instance
	 * @param {string} key The key in storage to set
	 * @param {any} value The value to set
	 * @returns {Promise<void>}
	 */
	public async set(key: string, value: any): Promise<void>
	{
		if (typeof key === 'undefined') throw new TypeError('Key must be provided');
		if (typeof key !== 'string') throw new TypeError('Key must be a string');
		if (typeof value === 'undefined') throw new TypeError('Value must be provided');

		try { JSON.stringify(value); }
		catch { value = {}; }

		if (key.includes('.'))
		{
			let path: string[] = key.split('.');
			key = path.shift()!;

			if (typeof this._cache[key] === 'undefined')
				this._cache[key] = {};

			Util.assignNestedValue(this._cache[key], path, value);
		}
		else this._cache[key] = value;

		await this._provider.set(this._key, JSON.stringify(this._cache));
	}

	/**
	 * Remove a value from storage for this instance
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
			key = path.shift()!;

			if (typeof this._cache[key] !== 'undefined')
				Util.removeNestedValue(this._cache[key], path);
		}
		else delete this._cache[key];

		await this._provider.set(this._key, JSON.stringify(this._cache));
	}

	/**
	 * Remove all key/value pairs from storage for this instance
	 * @returns {Promise<void>}
	 */
	public async clear(): Promise<void>
	{
		this._cache = {};
		await this._provider.set(this._key, JSON.stringify(this._cache));
	}
}
