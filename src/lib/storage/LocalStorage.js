'use babel';
'use strict';

import Database from 'node-json-db';

export default class LocalStorage
{
	constructor(fileName)
	{
		if (!fileName) throw new Error('You must provide a file name for the LocalStorage');

		this.data = null;
		this.db = new Database(fileName, true, true);
		this.load();
	}

	// Return the number of keys in LocalStorage
	get length()
	{
		return Object.keys(this.data).length || 0;
	}

	// Load the data from the persistent storage into memory
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

	// Write to persistent storage
	save()
	{
		this.db.push('/', this.data, true);
	}

	// Return the name of key at the given index
	key(index)
	{
		if (!index || index < 0) return null;
		this.load();
		if (index >= this.data.length) return null;
		return Object.keys(this.data)[index];
	}

	// Return the value of the given key LocalStorage
	getItem(key)
	{
		if (!key) return null;
		this.load();
		return this.data[key] || null;
	}

	// Set the value of a key
	setItem(key, value)
	{
		if (!value) return;
		this.load();
		this.data[key] = value;
		this.save();
	}

	// Delete the item from storage
	removeItem(key)
	{
		if (!key) return;
		this.load();
		delete this.data[key];
		this.save();
	}

	// See if a key/value pair exists
	exists(key)
	{
		return !!this.getItem(key);
	}

	// Delete all items from storage
	clear()
	{
		this.data = {};
		this.save();
	}
}
