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

		// If the number of guilds in localStorage doesn't match
		// the number of guilds the bot is a member of, assume
		// this means there are guilds that have not yet been
		// assigned storage and create storage for them
		if (dataStorage.length !== this._bot.guilds.size)
		{
			this.initNewGuilds(dataStorage, settingsStorage);
		}
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
		let storagelessGuilds = this._bot.guilds.filter(guild =>
			!dataStorage.keys.includes(guild.id));
		if (storagelessGuilds.size > 0)
		{
			storagelessGuilds.forEach(guild =>
			{
				this._bot.guildStorages.set(guild.id, new GuildStorage(this._bot, guild.id, dataStorage, settingsStorage));
			});
		}
	}
}
