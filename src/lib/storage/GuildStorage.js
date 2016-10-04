'use babel';
'use strict';

// Store settings and other data for an individual guild
export default class GuildStorage
{
	constructor(bot, guild, localStorage)
	{
		this.id = guild.id || guild;
		this.localStorage = localStorage;
		this.data = this.localStorage.getItem(this.id) || null;

		// Create blank storage for the guild if no storage is present
		if (!this.data)
		{
			this.localStorage.setItem(this.id, {});
			this.data = this.localStorage.getItem(this.id);
		}

		// Set default settings if no settings are present
		if (!this.data.settings)
		{
			this.data.settings = bot.storage.getItem('defaultGuildSettings');
			this.save();
		}
	}

	// Load the data from localStorage for this guild
	load()
	{
		this.data = this.localStorage.getItem(this.id);
	}

	// Write to localStorage
	save()
	{
		this.localStorage.setItem(this.id, this.data);
	}

	// Settings storage ////////////////////////////////////////////////////////

	// Return the number of keys in this guild's settings
	get settingLength()
	{
		this.load();
		return this.data.settings.length;
	}

	// Return the names of all keys in this guild's settings
	get settingKeys()
	{
		this.load();
		return Object.keys(this.data.settings);
	}

	// Return the name of the key at the given index in this guild's settings
	settingKey(index)
	{
		if (!index || index < 0) return null;
		this.load();
		if (index >= this.data.settings.length) return null;
		return Object.keys(this.data.settings)[index];
	}

	// Return the value of the given key in this guild's settings
	getSetting(key)
	{
		if (!key) return null;
		this.load();
		return this.data.settings[key] || null;
	}

	// Set the value of a settings in this guild's settings
	setSetting(key, value)
	{
		if (!key || !value) return;
		this.data.settings[key] = value;
		this.save();
	}

	// Delete a setting in this guild's settings
	removeSetting(key)
	{
		if (!key) return;
		delete this.data.settings[key];
		this.save();
	}

	// Check if a setting exists
	settingExists(key)
	{
		return !!this.getSetting(key);
	}

	// Reset the settings for this guild to default
	resetSettings(defaults)
	{
		this.data.settings = defaults;
		this.save();
	}

	// Non-settings storage ////////////////////////////////////////////////////

	// Return the number of keys in storage for this guild, not counting settings
	get length()
	{
		this.load();
		return Object.keys(this.data).length - 1 || 0;
	}

	// Return the names of all keys in storage for this guild, not counting settings
	get keys()
	{
		this.load();
		return Object.keys(this.data).filter(key => key !== 'settings');
	}

	// Return the name of the key at the given index in this guild's storage
	key(index)
	{
		if (!index || index < 0) return null;
		this.load();
		if (index >= this.data.length) return null;
		return Object.keys(this.data)[index];
	}

	// Return the value of the given key in this guild's storage
	getItem(key)
	{
		if (!key || key === 'settings') return null;
		this.load();
		return this.data[key] || null;
	}

	// Set the value of a given key in this guild's storage
	setItem(key, value)
	{
		if (!key || key === 'settings') return;
		this.load();
		this.data[key] = value;
		this.save();
	}

	// Delete the item from this guild's storage
	removeItem(key)
	{
		if (!key || key === 'settings') return;
		this.load();
		delete this.data[key];
		this.save();
	}

	// Check if guild storage key/value pair exists
	exists(key)
	{
		return !!this.getItem(key);
	}

	// Delete all non-settings items from storage
	clear()
	{
		this.data = { settings: this.data.settings };
		this.save();
	}
}
