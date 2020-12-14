/* eslint-disable no-param-reassign */
import { StorageProvider } from './StorageProvider';
import { StorageProviderConstructor } from '../types/StorageProviderConstructor';
import { Util } from '../util/Util';

/**
 * Simple async key/value storage abstraction operating on top of
 * a single StorageProvider instance. Each key in this storage
 * reflects a single key in the given StorageProvider
 *
 * >Supports nested object paths in get/set/remove using `.`
 * like normal object accessors
 * @param {string} name Unique identifier for this storage, used by the given StorageProvider
 * @param {StorageProviderConstructor} provider The storage provider class that will be instantiated
 * 												and used as the backend for this storage abstraction
 */
export class SingleProviderStorage
{
	private readonly _storage: StorageProvider;

	public constructor(name: string, provider: StorageProviderConstructor)
	{
		// eslint-disable-next-line new-cap
		this._storage = new provider(name);
	}

	/**
	 * Initialize this storage. Any other method calls should not be made
	 * until this method has been called and resolved
	 * @returns {Promise<void>}
	 */
	public async init(): Promise<void>
	{
		await this._storage.init();
	}

	/**
	 * Get the names of all keys in this storage
	 * @returns {Promise<string[]>}
	 */
	public async keys(): Promise<string[]>
	{
		return this._storage.keys();
	}

	/**
	 * Get a value from this storage for the specified key
	 * @param {string} key The key in storage to get
	 * @returns {Promise<any>}
	 */
	public async get(key: string): Promise<any>
	{
		if (typeof key === 'undefined') throw new TypeError('Key must be provided');
		if (typeof key !== 'string') throw new TypeError('Key must be a string');

		if (key.includes('.'))
		{
			const path: string[] = key.split('.');
			const stringData: string = (await this._storage.get(path.shift()!))!;
			if (typeof stringData === 'undefined') return;
			const data: object = JSON.parse(stringData);
			return Util.getNestedValue(data, path);
		}

		const stringData: string = (await this._storage.get(key))!;
		if (typeof stringData === 'undefined') return;
		return JSON.parse(stringData);
	}

	/**
	 * Check if a value exists in storage
	 * @param {string} key The key in storage to check
	 * @returns {Promise<boolean>}
	 */
	public async exists(key: string): Promise<boolean>
	{
		return typeof await this.get(key) !== 'undefined';
	}

	/**
	 * Set a value in this storage for the specified key
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

		let data: any;
		if (key.includes('.'))
		{
			const path: string[] = key.split('.');
			key = path.shift()!;

			data = await this.get(key);
			if (typeof data === 'undefined') data = {};

			Util.assignNestedValue(data, path, value);
		}
		else data = value;

		await this._storage.set(key, JSON.stringify(data));
	}

	/**
	 * Remove a key/value pair from this storage
	 * @param {string} key The key in storage to remove
	 * @returns {Promise<void>}
	 */
	public async remove(key: string): Promise<void>
	{
		if (typeof key === 'undefined') throw new Error('Key must be provided');
		if (typeof key !== 'string') throw new Error('Key must be a string');

		let data: any;
		if (key.includes('.'))
		{
			const path: string[] = key.split('.');
			key = path.shift()!;

			data = await this.get(key);
			if (typeof data !== 'undefined')
				Util.removeNestedValue(data, path);

			await this._storage.set(key, JSON.stringify(data));
		}
		else await this._storage.remove(key);
	}

	/**
	 * Remove all key/value pairs from this storage
	 * @returns {Promise<void>}
	 */
	public async clear(): Promise<void>
	{
		await this._storage.clear();
	}
}
