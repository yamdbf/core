'use babel';
'use strict';

import GuildStorage from './GuildStorage';

/**
 * Handles loading all guild-specific data from persistent storage into
 * {@link GuildStorage} objects
 * @class GuildStorageLoader
 */
export default class GuildStorageLoader
{
	constructor(bot)
	{
		/** @type {Bot} */
		this._bot = bot;
	}

	/**
	 * Load data for each guild from persistent storage and store it in a
	 * {@link GuildStorage} object
	 * @memberof GuildStorageLoader
	 * @instance
	 * @param {LocalStorage} dataStorage - LocalStorage instance containing all guild-specific data
	 * @param {LocalStorage} settingsStorage - LocalStorage instance containing all guild-specific settings
	 */
	loadStorages(dataStorage, settingsStorage)
	{
		dataStorage.keys.forEach((key) =>
		{
			this._bot.guildStorages.set(key, new GuildStorage(this._bot, key, dataStorage, settingsStorage));
		});

		this.initNewGuilds(dataStorage, settingsStorage);
	}

	/**
	 * Assign a GuildStorage to guilds that lack one due to the bot being
	 * in the guild before adopting this storage spec or the bot being
	 * added to a new guild
	 * @memberof GuildStorageLoader
	 * @instance
	 * @param {LocalStorage} dataStorage - LocalStorage instance containing all guild-specific data
	 * @param {LocalStorage} settingsStorage - LocalStorage instance containing all guild-specific settings
	 */
	initNewGuilds(dataStorage, settingsStorage)
	{
		let storagelessGuilds = this._bot.guilds.filter(guild => !dataStorage.keys.includes(guild.id));
		storagelessGuilds.forEach(guild =>
		{
			this._bot.guildStorages.set(guild.id, new GuildStorage(this._bot, guild.id, dataStorage, settingsStorage));
		});
	}

	/**
	 * Clean out any storages/settings storages for guilds the
	 * bot is no longer a part of
	 * @memberof GuildStorageLoader
	 * @instance
	 * @param {LocalStorage} dataStorage - LocalStorage instance containing all guild-specific data
	 * @param {LocalStorage} settingsStorage - LocalStorage instance containing all guild-specific settings
	 */
	cleanGuilds(dataStorage, settingsStorage)
	{
		let guildlessStorages = dataStorage.keys.filter(guild => !this._bot.guilds.has(guild));
		let guildlessSettings = settingsStorage.keys.filter(guild => !this._bot.guilds.has(guild));
		guildlessSettings.forEach(settings => settingsStorage.removeItem(settings));
		guildlessStorages.forEach(storage =>
		{
			this._bot.guildStorages.delete(storage);
			dataStorage.removeItem(storage);
		});
	}
}
