'use babel';
'use strict';

import { Collection } from 'discord.js';

/**
 * Stores all guild-specific storages as &lt;[id]{@link GuildStorage#id}, {@link GuildStorage}&gt; pairs
 * @class GuildStorageRegistry
 * @extends {external:Collection}
 */
export default class GuildStorageRegistry extends Collection
{
	constructor()
	{
		super();
	}

	/**
	 * Get the GuildStorage by [Guild]{@link external:Guild} or guild id string
	 * @memberof GuildStorageRegistry
	 * @instance
	 * @param {(external:Guild|string)} guild - Guild object or guild id string
	 * @returns {GuildStorage}
	 */
	get(guild)
	{
		return super.get(guild.id ? guild.id : guild);
	}

	/**
	 * Return a [Collection]{@link external:Collection} of GuildStorage items that
	 * have the provided key and value
	 * @memberof GuildStorageRegistry
	 * @instance
	 * @param {string} key - Setting key to match
	 * @param {*} value - Value to match
	 * @returns {external:Collection<string, GuildStorage>}
	 */
	findAll(key, value)
	{
		let collection = new Collection();
		this.forEach(guild =>
		{
			if (guild.getItem(key) === value) collection.set(guild.id, guild);
		});
		if (collection.size === 0) return null;
		return collection;
	}

	/**
	 * Return a [Collection]{@link external:Collection} of GuildStorage items that
	 * have the provided setting key and value
	 * @memberof GuildStorageRegistry
	 * @instance
	 * @param {string} key - Setting key to match
	 * @param {*} value - Value to match
	 * @returns {external:Collection<string, GuildStorage>}
	 */
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

	/**
	 * Reset all guild settings to default, deleting any extra settings that are
	 * not part of the [defaultGuildSettings]{@link Bot#defaultGuildSettings}
	 * @memberof GuildStorageRegistry
	 * @instance
	 * @param {Object} defaults - Should always use [defaultGuildSettings]{@link Bot#defaultGuildSettings}
	 */
	resetAllGuildSettings(defaults)
	{
		super.forEach(guild => guild.resetSettings(defaults));
	}
}
