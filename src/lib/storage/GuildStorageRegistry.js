'use babel';
'use strict';

import { Collection } from 'discord.js';

// Handle loading all GuildStorage objects
export default class GuildStorageRegistry extends Collection
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

	// Return a collection of of guilds with a specific setting value
	findAllBySetting(key, value)
	{
		let collection = new Collection();
		this.forEach(guild =>
		{
			if (guild.getSetting(key) === value) collection.set(guild.id, guild);
		});
		if (collection.size === 0) return null;
		return collection;
	}

	// Reset all guild settings to default
	resetAllGuildSettings(defaults)
	{
		super.forEach(guild => guild.resetSettings(defaults));
	}
}
