'use babel';
'use strict';

import GuildStorage from './GuildStorage';

// Handle loading all GuildStorage objects
export default class GuildStorageLoader extends Map
{
	constructor()
	{
		super();
	}

	// Allow guild lookup by Guild object or id string
	get(guild)
	{
		return super.get(guild.id ? guild.id : guild);
	}

	// Load all guild storages from localStorage
	load(bot, localStorage)
	{
		Object.keys(localStorage.data).forEach((key) =>
		{
			super.set(key, new GuildStorage(key, localStorage));
		});

		// If the number of guilds in localStorage doesn't match
		// the number of guilds the bot is a member of, assume
		// this means there are guilds that have not yet been
		// assigned storage and create storage for them
		if (localStorage.data.length !== bot.guilds.size)
		{
			this.initNewGuilds(bot, localStorage);
		}
	}

	// Assign guild storage to guilds that lack one due to the bot
	// being in the guild before adopting this storage spec
	initNewGuilds(bot, localStorage)
	{
		let storagelessGuilds = bot.guilds.filter(guild =>
			!Object.keys(localStorage.data).includes(guild.id));
		if (storagelessGuilds.size > 0)
		{
			storagelessGuilds.forEach(guild =>
			{
				super.set(guild.id, new GuildStorage(guild.id, localStorage));
			});
		}
	}

	// Reset all guild settings to default
	resetAllGuildSettings()
	{
		super.forEach(guild => guild.resetSettings());
	}
}
