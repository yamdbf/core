'use babel';
'use strict';

/**
 * Handle loading, saving, and storing Guild data and settings
 * via persistent storage. Created automatically per-guild
 * by {@link GuildStorageLoader}
 * @class GuildStorage
 * @param {Bot} bot - Bot instance
 * @param {(external:Guild|string)} guild - Discord.js Guild object or guild ID string
 * @param {LocalStorage} localStorage - LocalStorage instance containing all guild-specific data
 */
export default class GuildStorage
{
	constructor(bot, guild, dataStorage, settingsStorage)
	{
		/**
		 * Discord.js Guild ID string
		 * @memberof GuildStorage
		 * @instance
		 * @type {string}
		 * @name id
		 */
		this.id = guild.id || guild;

		/**
		 * LocalStorage instance containing all guild-specific data
		 * @memberof GuildStorage
		 * @instance
		 * @type {LocalStorage}
		 * @name dataStorage
		 */
		this.dataStorage = dataStorage;

		/**
		 * LocalStorage instance containing all guild-specific settings
		 * @memberof GuildStorage
		 * @instance
		 * @type {LocalStorage}
		 * @name settingsStorage
		 */
		this.settingsStorage = settingsStorage;

		/**
		 * The storage data, loaded from persistent storage, kept in memory
		 * @memberof GuildStorage
		 * @instance
		 * @type {Object}
		 * @name data
		 */
		this.data = this.dataStorage.getItem(this.id) || null;

		/**
		 * The settings data, loaded from persistent storage, kept in memory
		 * @memberof GuildStorage
		 * @instance
		 * @type {Object}
		 * @name settings
		 */
		this.settings = this.settingsStorage.getItem(this.id) || null;

		/**
		 * Temporary key/value storage, cleared on creation
		 * @memberof GuildStorage
		 * @instance
		 * @type {Object}
		 * @name temp
		 */
		this.temp = {};

		// Create blank storage for the guild if no storage is present
		if (!this.data)
		{
			this.data = {};
			this.save();
		}

		// Set default settings if no settings are present
		if (!this.settings)
		{
			this.settings = bot.storage.getItem('defaultGuildSettings');
			this.save();
		}
	}

	/**
	 * Load the data for this guild from dataStorage, settingsStorage
	 * @memberof GuildStorage
	 * @instance
	 */
	load()
	{
		this.data = this.dataStorage.getItem(this.id);
		this.settings = this.settingsStorage.getItem(this.id);
	}

	/**
	 * Write to dataStorage, settingsStorage for this guild
	 * @memberof GuildStorage
	 * @instance
	 */
	save()
	{
		this.dataStorage.setItem(this.id, this.data);
		this.settingsStorage.setItem(this.id, this.settings);
	}

	// Settings storage ////////////////////////////////////////////////////////

	/**
	 * The number of keys in this Guild's settings
	 * @memberof GuildStorage
	 * @instance
	 * @type {number}
	 */
	get settingsLength()
	{
		this.load();
		return this.settings.length;
	}

	/**
	 * The names of all keys in this guild's settings
	 * @memberof GuildStorage
	 * @instance
	 * @type {string[]}
	 */
	get settingsKeys()
	{
		this.load();
		return Object.keys(this.settings);
	}

	/**
	 * Get the name of the key at the given index in this guild's settings
	 * @memberof GuildStorage
	 * @instance
	 * @param {number} index - The index of the key to find
	 * @returns {string}
	 */
	settingKey(index)
	{
		if (!index || index < 0) return null;
		this.load();
		if (index >= this.settings.length) return null;
		return Object.keys(this.settings)[index];
	}

	/**
	 * Get the value of the given key in this guild's settings
	 * @memberof GuildStorage
	 * @instance
	 * @param {string} key - The key of the setting to get
	 * @returns {*}
	 */
	getSetting(key)
	{
		if (typeof key !== 'string') return null;
		this.load();
		return this.settings[key] || null;
	}

	/**
	 * Set the value of a setting in this guild's settings
	 * @memberof GuildStorage
	 * @instance
	 * @param {string} key - The key of the setting to set
	 * @param {*} value - The value to set
	 */
	setSetting(key, value)
	{
		if (typeof key !== 'string') return;
		if (typeof value === 'undefined') value = '';
		this.settings[key] = value;
		this.save();
	}

	/**
	 * Delete a setting in this guild's settings
	 * @memberof GuildStorage
	 * @instance
	 * @param {string} key - The key of the setting to delete
	 */
	removeSetting(key)
	{
		if (typeof key !== 'string') return;
		delete this.settings[key];
		this.save();
	}

	/**
	 * Check if a setting exists
	 * @memberof GuildStorage
	 * @instance
	 * @param {string} key - The key of the setting to check for
	 * @returns {boolean}
	 */
	settingExists(key)
	{
		if (typeof key !== 'string') return false;
		return !!this.getSetting(key);
	}

	/**
	 * Reset the settings for this guild to default, deleting any
	 * extra settings that are not part of the [defaultGuildSettings]{@link Bot#defaultGuildSettings}
	 * @memberof GuildStorage
	 * @instance
	 * @param {Object} defaults - Should always use [defaultGuildSettings]{@link Bot#defaultGuildSettings}
	 */
	resetSettings(defaults)
	{
		this.settings = defaults;
		this.save();
	}

	// Non-settings storage ////////////////////////////////////////////////////

	/**
	 * The number of keys in this guild's storage, not counting settings
	 * @memberof GuildStorage
	 * @instance
	 * @type {number}
	 */
	get length()
	{
		this.load();
		return Object.keys(this.data).length - 1 || 0;
	}

	/**
	 * The names of all keys in this guild's storage, not counting settings
	 * @memberof GuildStorage
	 * @instance
	 * @type {string[]}
	 */
	get keys()
	{
		this.load();
		return Object.keys(this.data);
	}

	/**
	 * Get the name of the key at the given index in this guild's storage
	 * @memberof GuildStorage
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
	 * Get the value of the given key in this guild's storage
	 * @memberof GuildStorage
	 * @instance
	 * @param {string} key - The key of the item to get
	 * @returns {*}
	 */
	getItem(key)
	{
		if (typeof key !== 'string') return null;
		this.load();
		return this.data[key] || null;
	}

	/**
	 * Set the value of a given key in this guild's storage
	 * @memberof GuildStorage
	 * @instance
	 * @param {string} key - The key of the item to set
	 * @param {*} value - The value to set
	 */
	setItem(key, value)
	{
		if (typeof key !== 'string') return;
		if (typeof value === 'undefined') value = '';
		this.load();
		this.data[key] = value;
		this.save();
	}

	/**
	 * Delete an item in this guild's storage
	 * @memberof GuildStorage
	 * @instance
	 * @param {string} key - The key of the item to delete
	 */
	removeItem(key)
	{
		if (typeof key !== 'string') return;
		this.load();
		delete this.data[key];
		this.save();
	}

	/**
	 * Check if key/value pair exists in this guild's storage
	 * @memberof GuildStorage
	 * @instance
	 * @param {string} key - The key of the item to check for
	 * @returns {boolean}
	 */
	exists(key)
	{
		if (typeof key !== 'string') return false;
		return !!this.getItem(key);
	}

	/**
	 * Delete all data from this guild's storage
	 * @memberof GuildStorage
	 * @instance
	 */
	clear()
	{
		this.load();
		this.data = {};
		this.save();
	}

	/**
	 * Allow access to a storage/settings item only when it is not currently being
	 * accessed. Waits for other nonConcurrentAccess operations to finish
	 * before proceeding with callback
	 * @memberof GuildStorage
	 * @instance
	 * @param {string} key - the storage key you will be accessing
	 * @param {function} callback - callback to execute that will be accessing the key
	 * @returns {Promise}
	 */
	nonConcurrentAccess(key, callback)
	{
		return new Promise((resolve, reject) =>
		{
			try
			{
				while(this.temp[`checking${key}`]) {} // eslint-disable-line
				this.temp[`checking${key}`] = true;
				callback(key); // eslint-disable-line
				delete this.temp[`checking${key}`];
				resolve();
			}
			catch (err)
			{
				delete this.temp[`checking${key}`];
				reject(err);
			}
		});
	}
}
