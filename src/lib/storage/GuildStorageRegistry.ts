import { Collection, Guild } from 'discord.js';
import { GuildStorage } from './GuildStorage';
import { DefaultGuildSettings } from '../types/DefaultGuildSettings';

/**
 * Stores all guild-specific storages as &lt;{@link string}, {@link GuildStorage}&gt; pairs,
 * where {@link string} is the guild's ID string
 * @class GuildStorageRegistry
 * @extends {external:Collection}
 */
export class GuildStorageRegistry<K extends string, V extends GuildStorage> extends Collection<K, V>
{
	public constructor() { super(); }

	public get(guild: K): V
	public get(guild: Guild): V
	/**
	 * Get the GuildStorage by [Guild]{@link external:Guild} or guild id string
	 * @memberof GuildStorageRegistry
	 * @instance
	 * @param {(external:Guild|string)} guild Guild object or guild id string
	 * @returns {GuildStorage}
	 */
	public get(guild: Guild | K): V
	{
		return super.get((<Guild> guild).id ? <K> (<Guild> guild).id : <K> guild);
	}

	public findAll(key: string, value: any): Collection<K, V>
	public findAll(key: keyof V, value: any): any
	/**
	 * Return a [Collection]{@link external:Collection} of GuildStorage items that
	 * have the provided key and value
	 * @memberof GuildStorageRegistry
	 * @instance
	 * @param {string} key Setting key to match
	 * @param {any} value Value to match
	 * @returns {external:Collection<string, GuildStorage>}
	 */
	public findAll(key: string | keyof V, value: any): Collection<K, V>
	{
		return super.filter(a => a.getItem(key) === value);
	}

	/**
	 * Return a [Collection]{@link external:Collection} of GuildStorage items that
	 * have the provided setting key and value
	 * @memberof GuildStorageRegistry
	 * @instance
	 * @param {string} key Setting key to match
	 * @param {any} value Value to match
	 * @returns {external:Collection<string, GuildStorage>}
	 */
	public findAllBySetting(key: string, value: any): Collection<K, V>
	{
		return super.filter(a => a.getSetting(key) === value);
	}

	/**
	 * Reset all guild settings to default, deleting any extra settings that are
	 * not part of the [DefaultGuildSettings]{@link DefaultGuildSettings}
	 * @memberof GuildStorageRegistry
	 * @instance
	 * @param {DefaultGuildSettings} defaults Should always use [DefaultGuildSettings]{@link DefaultGuildSettings}
	 */
	public resetAllGuildSettings(defaults: DefaultGuildSettings): void
	{
		for (const guild of this.values()) guild.resetSettings(defaults);
	}
}
