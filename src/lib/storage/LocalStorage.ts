import * as Database from 'node-json-db';

/**
 * Creates a persistent storage file and handles interacting with the persistent
 * storage
 * @class LocalStorage
 * @param {string} fileName - The name of the persistent storage file. Will be json format
 */
export class LocalStorage
{
	private _db: Database;
	private _temp: { [key: string]: any };

	public constructor(fileName: string)
	{
		if (!fileName) throw new Error('You must provide a file name for the LocalStorage');

		/** @type {Object} */
		this._db = new Database(fileName, true, true);

		/** @type {Object} */
		this._temp = {};
	}

	/**
	 * The number of keys in this storage
	 * @memberof LocalStorage
	 * @instance
	 * @type {number}
	 */
	public get length(): number
	{
		try
		{
			let data: object = this._db.getData('/');
			return Object.keys(data).length || 0;
		}
		catch (err)
		{
			return 0;
		}
	}

	/**
	 * The names of all keys in this storage
	 * @memberof LocalStorage
	 * @instance
	 * @type {string[]}
	 */
	public get keys(): string[]
	{
		try
		{
			let data: object = this._db.getData('/');
			return Object.keys(data);
		}
		catch (err)
		{
			return [];
		}
	}

	/**
	 * Get the name of the key at the given index in this storage
	 * @memberof LocalStorage
	 * @instance
	 * @param {number} index The index of the key to find
	 * @returns {string}
	 */
	public key(index: number): string
	{
		if (!index || index < 0) return null;
		try
		{
			let data: object = this._db.getData('/');
			if (index >= Object.keys(data).length) return null;
			return Object.keys(data)[index];
		}
		catch (err)
		{
			return null;
		}
	}

	/**
	 * Get the value of the given key in this storage
	 * @memberof LocalStorage
	 * @instance
	 * @param {string} key The key of the item to get
	 * @returns {*}
	 */
	public getItem(key: string): any
	{
		if (typeof key !== 'string') return null;
		try
		{
			let data: object = this._db.getData(`/${key}`);
			return JSON.parse(JSON.stringify(data));
		}
		catch (err)
		{
			return null;
		}
	}

	/**
	 * Set the value of a given key in this storage
	 * @memberof LocalStorage
	 * @instance
	 * @param {string} key The key of the item to set
	 * @param {*} value The value to set
	 */
	public setItem(key: string, value: any): void
	{
		if (typeof key !== 'string') return;
		if (typeof value === 'undefined') value = '';
		this._db.push(`/${key}`, JSON.parse(JSON.stringify(value)), true);
	}

	// Handle increment/deincrement of stored integer values
	private _modifyStoredInt(key: string, type: '++' | '--'): void
	{
		if (typeof key !== 'string') return;
		if (type !== '++' && type !== '--') return;
		let value: any = this.getItem(key);
		if (!Number.isInteger(value)) return;
		this.setItem(key, type === '++' ? ++value : --value);
	}

	/**
	 * Increment a stored integer value
	 * @memberof LocalStorage
	 * @instance
	 * @param {string} key The key of the item to increment
	 */
	public incr(key: string): void { this._modifyStoredInt(key, '++'); }

	/**
	 * Deincrement a stored integer value
	 * @memberof LocalStorage
	 * @instance
	 * @param {string} key The key of the item to increment
	 */
	public deincr(key: string): void { this._modifyStoredInt(key, '--'); }

	/**
	 * Delete an item in this storage
	 * @memberof LocalStorage
	 * @instance
	 * @param {string} key The key of the item to delete
	 */
	public removeItem(key: string): void
	{
		if (typeof key !== 'string') return;
		this._db.delete(`/${key}`);
	}

	/**
	 * Check if key/value pair exists in this storage
	 * @memberof LocalStorage
	 * @instance
	 * @param {string} key The key of the item to check for
	 * @returns {boolean}
	 */
	public exists(key: string): boolean
	{
		if (typeof key !== 'string') return false;
		return this.getItem(key) !== null;
	}

	/**
	 * Delete all items from this storage
	 * @memberof LocalStorage
	 * @instance
	 */
	public clear(): void
	{
		this._db.push('/', {}, true);
	}

	/**
	 * Allow access to a storage item only when it is not currently being
	 * accessed. Waits for other queued operations to finish before
	 * proceeding with the provided callback
	 * @memberof LocalStorage
	 * @instance
	 * @param {string} key the storage key you will be accessing
	 * @param {function} callback callback to execute that will be accessing the key
	 * @returns {Promise}
	 */
	public queue<T extends string>(key: T, callback: (key: T) => void): Promise<void>
	{
		return new Promise<void>((resolve, reject) =>
		{
			try
			{
				while (this._temp[`checking${key}`]) {}
				this._temp[`checking${key}`] = true;
				const finished: any = callback(key);
				if (finished instanceof Promise)
				{
					finished.then(() =>
					{
						delete this._temp[`checking${key}`];
						resolve();
					})
					.catch(err =>
					{
						delete this._temp[`checking${key}`];
						reject(err);
					});
				}
				else
				{
					delete this._temp[`checking${key}`];
					resolve();
				}
			}
			catch (err)
			{
				delete this._temp[`checking${key}`];
				reject(err);
			}
		});
	}
}
