import { DefaultGuildSettings } from '../types/DefaultGuildSettings';
import { LocalStorage } from './LocalStorage';
import { Bot } from '../bot/Bot';
import { Guild } from 'discord.js';

/**
 * Handle loading, saving, and storing Guild data and settings
 * via persistent storage. Created automatically per-guild
 * by {@link GuildStorageLoader}
 * @class GuildStorage
 * @param {Bot} bot - Bot instance
 * @param {(external:Guild|string)} guild - Discord.js Guild object or guild ID string
 * @param {LocalStorage} dataStorage - LocalStorage instance containing all guild-specific data
 * @param {LocalStorage} settingsStorage - LocalStorage instance containing all guild-specific settings
 */
export class GuildStorage
{
	private _id: string;
	private _dataStorage: LocalStorage;
	private _settingsStorage: LocalStorage;
	private _temp: { [key: string]: any };

	public constructor(bot: Bot, guild: Guild | string, dataStorage: LocalStorage, settingsStorage: LocalStorage)
	{
		/** @type {string} */
		this._id = (<Guild> guild).id || <string> guild;

		/** @type {LocalStorage} */
		this._dataStorage = dataStorage;

		/** @type {LocalStorage} */
		this._settingsStorage = settingsStorage;

		/** @type {Object} */
		this._temp = {};

		// Create blank storage for the guild if no storage is present
		if (!this._dataStorage.exists(this.id)) this._dataStorage.setItem(this.id, {});

		// Set default settings if no settings are present
		if (!this._settingsStorage.exists(this.id))
		{
			this._settingsStorage.setItem(this.id, {});
			let defaults: DefaultGuildSettings = bot.storage.getItem('defaultGuildSettings');
			for (const key of Object.keys(defaults))
				this._settingsStorage.setItem(`${this.id}/${key}`, defaults[key]);
		}
	}

	/**
	 * Discord.js Guild ID string
	 * @memberof GuildStorage
	 * @instance
	 * @type {string}
	 * @name id
	 */
	public get id(): string { return this._id; }

	// Handle increment/deincrement of stored integer values
	private _modifyStoredInt(key: string, type: '++' | '--', storage: 'storage' | 'settings'): void
	{
		if (typeof key !== 'string') return;
		if (type !== '++' && type !== '--') return;
		if (storage !== 'storage' && storage !== 'settings') return;
		let ls: LocalStorage = storage === 'storage' ? this._dataStorage : this._settingsStorage;
		let value: number = ls.getItem(`${this._id}/${key}`);
		if (!Number.isInteger(value)) return;
		ls.setItem(`${this._id}/${key}`, type === '++' ? ++value : --value);
	}

//#region Settings storage

	/**
	 * The number of keys in this Guild's settings
	 * @memberof GuildStorage
	 * @instance
	 * @type {number}
	 */
	public get settingsLength(): number { return Object.keys(this._settingsStorage.getItem(this.id)).length || 0; }

	/**
	 * The names of all keys in this guild's settings
	 * @memberof GuildStorage
	 * @instance
	 * @type {string[]}
	 */
	public get settingsKeys(): string[] { return Object.keys(this._settingsStorage.getItem(this.id)); }

	/**
	 * Get the name of the key at the given index in this guild's settings
	 * @memberof GuildStorage
	 * @instance
	 * @param {number} index The index of the key to find
	 * @returns {string}
	 */
	public settingKey(index: number): string
	{
		if (!index || index < 0) return null;
		let settings: object = this._settingsStorage.getItem(this.id);
		if (index >= Object.keys(settings).length) return null;
		return Object.keys(settings)[index];
	}

	/**
	 * Get the value of the given key in this guild's settings
	 * @memberof GuildStorage
	 * @instance
	 * @param {string} key The key of the setting to get
	 * @returns {*}
	 */
	public getSetting(key: string): any
	{
		if (typeof key !== 'string') return null;
		return this._settingsStorage.getItem(`${this.id}/${key}`);
	}

	/**
	 * Set the value of a setting in this guild's settings
	 * @memberof GuildStorage
	 * @instance
	 * @param {string} key The key of the setting to set
	 * @param {*} value The value to set
	 */
	public setSetting(key: string, value: any): void
	{
		if (typeof key !== 'string') return;
		if (typeof value === 'undefined') value = '';
		this._settingsStorage.setItem(`${this.id}/${key}`, value);
	}

	/**
	 * Increment a stored integer settings value
	 * @memberof GuildStorage
	 * @instance
	 * @param {string} key The key of the item to increment
	 */
	public incrSetting(key: string): void { this._modifyStoredInt(key, '++', 'settings'); }

	/**
	 * Deincrement a stored integer settings value
	 * @memberof GuildStorage
	 * @instance
	 * @param {string} key The key of the item to increment
	 */
	public deincrSetting(key: string): void { this._modifyStoredInt(key, '--', 'settings'); }

	/**
	 * Delete a setting in this guild's settings
	 * @memberof GuildStorage
	 * @instance
	 * @param {string} key The key of the setting to delete
	 */
	public removeSetting(key: string): void
	{
		if (typeof key !== 'string') return;
		this._settingsStorage.removeItem(`${this.id}/${key}`);
	}

	/**
	 * Check if a setting exists
	 * @memberof GuildStorage
	 * @instance
	 * @param {string} key The key of the setting to check for
	 * @returns {boolean}
	 */
	public settingExists(key: string): boolean
	{
		if (typeof key !== 'string') return false;
		return this.getSetting(key) !== null;
	}

	/**
	 * Reset the settings for this guild to default, deleting any
	 * extra settings that are not part of the provided defaults
	 * @example
	 * <GuildStorage>.resetSettings(<Bot>.storage.getItem('defaultGuildSettings'));
	 * @memberof GuildStorage
	 * @instance
	 * @param {Object} defaults Should always use {@link defaultGuildSettings}
	 */
	public resetSettings(defaults: DefaultGuildSettings): void
	{
		this._settingsStorage.setItem(this.id, defaults);
	}

//#endregion

//#region Regular storage

	/**
	 * The number of keys in this guild's storage
	 * @memberof GuildStorage
	 * @instance
	 * @type {number}
	 */
	public get length(): number
	{
		return Object.keys(this._dataStorage.getItem(this.id)).length || 0;
	}

	/**
	 * The names of all keys in this guild's storage
	 * @memberof GuildStorage
	 * @instance
	 * @type {string[]}
	 */
	public get keys(): string[]
	{
		return Object.keys(this._dataStorage.getItem(this.id));
	}

	/**
	 * Get the name of the key at the given index in this guild's storage
	 * @memberof GuildStorage
	 * @instance
	 * @param {number} index The index of the key to find
	 * @returns {string}
	 */
	public key(index: number): string
	{
		if (!index || index < 0) return null;
		let data: object = this._dataStorage.getItem(this.id);
		if (index >= Object.keys(data).length) return null;
		return Object.keys(data)[index];
	}

	/**
	 * Get the value of the given key in this guild's storage
	 * @memberof GuildStorage
	 * @instance
	 * @param {string} key The key of the item to get
	 * @returns {*}
	 */
	public getItem(key: string): any
	{
		if (typeof key !== 'string') return null;
		return this._dataStorage.getItem(`${this.id}/${key}`);
	}

	/**
	 * Set the value of a given key in this guild's storage
	 * @memberof GuildStorage
	 * @instance
	 * @param {string} key The key of the item to set
	 * @param {*} value The value to set
	 */
	public setItem(key: string, value: any): void
	{
		if (typeof key !== 'string') return;
		if (typeof value === 'undefined') value = '';
		this._dataStorage.setItem(`${this.id}/${key}`, value);
	}

	/**
	 * Increment a stored integer value
	 * @memberof GuildStorage
	 * @instance
	 * @param {string} key The key of the item to increment
	 */
	public incr(key: string): void { this._modifyStoredInt(key, '++', 'storage'); }

	/**
	 * Deincrement a stored integer value
	 * @memberof GuildStorage
	 * @instance
	 * @param {string} key - The key of the item to increment
	 */
	public deincr(key: string): void { this._modifyStoredInt(key, '--', 'storage'); }

	/**
	 * Delete an item in this guild's storage
	 * @memberof GuildStorage
	 * @instance
	 * @param {string} key - The key of the item to delete
	 */
	public removeItem(key: string): void
	{
		if (typeof key !== 'string') return;
		this._dataStorage.removeItem(`${this.id}/${key}`);
	}

	/**
	 * Check if key/value pair exists in this guild's storage
	 * @memberof GuildStorage
	 * @instance
	 * @param {string} key - The key of the item to check for
	 * @returns {boolean}
	 */
	public exists(key: string): boolean
	{
		if (typeof key !== 'string') return false;
		return !!this.getItem(key);
	}

	/**
	 * Delete all data from this guild's storage
	 * @memberof GuildStorage
	 * @instance
	 */
	public clear(): void
	{
		this._dataStorage.setItem(this.id, {});
	}

	/**
	 * Allow access to a storage/settings item only when it is not currently being
	 * accessed. Waits for other queued operations to finish before proceeding
	 * with the supplied callback
	 * @memberof GuildStorage
	 * @instance
	 * @param {string} key - the storage key you will be accessing
	 * @param {function} callback - callback to execute that will be accessing the key
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

//#endregion
}
