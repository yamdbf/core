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
		/**
		 * Bot instance
		 * @memberof GuildStorageLoader
		 * @type {Bot}
		 * @name bot
		 * @instance
		 */
		this.bot = bot;
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
		let data;
		try
		{
			data = dataStorage.db.getData('/');
		}
		catch (err)
		{
			data = {};
		}
		Object.keys(data).forEach((key) =>
		{
			this.bot.guildStorages.set(key, new GuildStorage(this.bot, key, dataStorage, settingsStorage));
		});

		// If the number of guilds in localStorage doesn't match
		// the number of guilds the bot is a member of, assume
		// this means there are guilds that have not yet been
		// assigned storage and create storage for them
		if (Object.keys(data).length !== this.bot.guilds.size)
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
		let data;
		try
		{
			data = dataStorage.db.getData('/');
		}
		catch (err)
		{
			data = {};
		}
		let storagelessGuilds = this.bot.guilds.filter(guild =>
			!Object.keys(data).includes(guild.id));
		if (storagelessGuilds.size > 0)
		{
			storagelessGuilds.forEach(guild =>
			{
				this.bot.guildStorages.set(guild.id, new GuildStorage(this.bot, guild.id, dataStorage, settingsStorage));
			});
		}
	}
}
