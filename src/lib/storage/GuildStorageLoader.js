'use babel';
'use strict';

import GuildStorage from './GuildStorage';

// Handle loading all GuildStorage objects
export default class GuildStorageLoader
{
	constructor(bot)
	{
		this.bot = bot;
	}

	// Load all guild storages from localStorage
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

	// Assign guild storage to guilds that lack one due to the bot
	// being in the guild before adopting this storage spec or adding
	// the bot to a new guild
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
