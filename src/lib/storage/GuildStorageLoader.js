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
	 * @param {LocalStorage} localStorage - LocalStorage instance containing all guild-specific data stores
	 */
	loadStorages(localStorage)
	{
		Object.keys(localStorage.data).forEach((key) =>
		{
			this.bot.guildStorages.set(key, new GuildStorage(this.bot, key, localStorage));
		});

		// If the number of guilds in localStorage doesn't match
		// the number of guilds the bot is a member of, assume
		// this means there are guilds that have not yet been
		// assigned storage and create storage for them
		if (localStorage.data.length !== this.bot.guilds.size)
		{
			this.initNewGuilds(localStorage);
		}
	}

	/**
	 * Assign a GuildStorage to guilds that lack one due to the bot being
	 * in the guild before adopting this storage spec or the bot being
	 * added to a new guild
	 * @memberof GuildStorageLoader
	 * @instance
	 * @param {LocalStorage} localStorage - LocalStorage instance containing all guild-specific data stores
	 */
	initNewGuilds(localStorage)
	{
		let storagelessGuilds = this.bot.guilds.filter(guild =>
			!Object.keys(localStorage.data).includes(guild.id));
		if (storagelessGuilds.size > 0)
		{
			storagelessGuilds.forEach(guild =>
			{
				this.bot.guildStorages.set(guild.id, new GuildStorage(this.bot, guild.id, localStorage));
			});
		}
	}
}
