'use babel';
'use strict';

import Database from 'node-json-db';

/**
 * Creates a persistent storage file and handles interacting with the persistent
 * storage
 * @class LocalStorage
 * @param {string} fileName - The name of the persistent storage file. Will be json format
 */
export default class LocalStorage
{
	constructor(fileName)
	{
		if (!fileName) throw new Error('You must provide a file name for the LocalStorage');

		/**
		 * The data loaded from persistent storage kept in memory
		 * @memberof LocalStorage
		 * @type {Object}
		 * @name data
		 * @instance
		 */
		this.data = null;

		/**
		 * Create or load the node-json-db database json file
		 * @memberof LocalStorage
		 * @type {Object}
		 * @name db
		 * @instance
		 */
		this.db = new Database(fileName, true, true);

		// Load the data from persistent storage
		this.load();
	}

	/**
	 * The number of keys in this storage
	 * @memberof LocalStorage
	 * @instance
	 * @type {number}
	 */
	get length()
	{
		return Object.keys(this.data).length || 0;
	}

	/**
	 * The names of all keys in this storage
	 * @memberof LocalStorage
	 * @instance
	 * @type {string[]}
	 */
	get keys()
	{
		this.load();
		return Object.keys(this.data);
	}

	/**
	 * Load the data from persistent storage into memory
	 * @memberof LocalStorage
	 * @instance
	 */
	load()
	{
		try
		{
			this.data = this.db.getData('/');
		}
		catch (err)
		{
			this.db.push('/', {}, true);
			this.data = this.db.getData('/');
		}
	}

	/**
	 * Write to persistent storage
	 * @memberof LocalStorage
	 * @instance
	 */
	save()
	{
		this.db.push('/', this.data, true);
	}

	/**
	 * Get the name of the key at the given index in this storage
	 * @memberof LocalStorage
	 * @instance
	 * @param {number} index - The index of the key to find
	 * @returns {string}
	 */
	key(index)
	{
		if (!index || index < 0) return null;
		this.load();
		if (index >= this.data.length) return null;
		return Object.keys(this.data)[index];
	}

	/**
	 * Get the value of the given key in this storage
	 * @memberof LocalStorage
	 * @instance
	 * @param {string} key - The key of the item to get
	 * @returns {*}
	 */
	getItem(key)
	{
		if (!key) return null;
		this.load();
		return this.data[key] || null;
	}

	// Set the value of a key
	/**
	 * Set the value of a given key in this storage
	 * @memberof LocalStorage
	 * @instance
	 * @param {string} key - The key of the item to set
	 * @param {*} value - The value to set
	 */
	setItem(key, value)
	{
		if (!key) return;
		if (!value) value = '';
		this.load();
		this.data[key] = value;
		this.save();
	}

	/**
	 * Delete an item in this storage
	 * @memberof LocalStorage
	 * @instance
	 * @param {string} key - The key of the item to delete
	 */
	removeItem(key)
	{
		if (!key) return;
		this.load();
		delete this.data[key];
		this.save();
	}

	/**
	 * Check if key/value pair exists in this storage
	 * @memberof LocalStorage
	 * @instance
	 * @param {string} key - The key of the item to check for
	 * @returns {boolean}
	 */
	exists(key)
	{
		return !!this.getItem(key);
	}

	/**
	 * Delete all non-settings items from this storage
	 * @memberof LocalStorage
	 * @instance
	 */
	clear()
	{
		this.data = {};
		this.save();
	}
}
