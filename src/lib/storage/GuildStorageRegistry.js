'use babel';
'use strict';

import { Collection } from 'discord.js';

/**
 * Stores all guild-specific storages as &lt;{@link string}, {@link GuildStorage}&gt; pairs,
 * where {@link string} is the guild's ID string
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
	get(guild) { return super.get(guild.id ? guild.id : guild); }

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
		return super.filter(a => a.getItem(key) === value);
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
		return super.filter(a => a.getSetting(key) === value);
	}

	/**
	 * Reset all guild settings to default, deleting any extra settings that are
	 * not part of the [DefaultGuildSettings]{@link DefaultGuildSettings}
	 * @memberof GuildStorageRegistry
	 * @instance
	 * @param {DefaultGuildSettings} defaults - Should always use [DefaultGuildSettings]{@link DefaultGuildSettings}
	 */
	resetAllGuildSettings(defaults)
	{
		super.forEach(guild => guild.resetSettings(defaults));
	}
}
