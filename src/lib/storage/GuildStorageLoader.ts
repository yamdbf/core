import { Collection, Guild } from 'discord.js';
import { Bot } from '../bot/Bot';
import { StorageProvider } from './StorageProvider';
import { createGuildStorageMixin } from '../storage/mixin/GuildStorageMixin';

/**
 * Handles loading all guild-specific data from persistent storage into
 * {@link GuildStorage} objects
 * @private
 */
export class GuildStorageLoader<T extends Bot>
{
	private _bot: T;
	public constructor(bot: T)
	{
		this._bot = bot;
	}

	/**
	 * Load data for each guild from persistent storage and store it in a
	 * {@link GuildStorage} object
	 */
	public async loadStorages(dataStorage: StorageProvider, settingsStorage: StorageProvider): Promise<void>
	{
		for (const key of await dataStorage.keys())
			// this._bot.guildStorages.set(key, new GuildStorage(this._bot, key, dataStorage, settingsStorage));
			this._bot.storage.guilds.set(key, await createGuildStorageMixin(
				dataStorage, settingsStorage, this._bot.guilds.get(key), this._bot));

		await this.initNewGuilds(dataStorage, settingsStorage);
	}

	/**
	 * Assign a GuildStorage to guilds that lack one due to the bot being
	 * in the guild before adopting this storage spec or the bot being
	 * added to a new guild
	 */
	public async initNewGuilds(dataStorage: StorageProvider, settingsStorage: StorageProvider): Promise<void>
	{
		const dataStorageKeys: string[] = await dataStorage.keys();
		let storagelessGuilds: Collection<string, Guild> = this._bot.guilds.filter(g => !dataStorageKeys.includes(g.id));
		for (const guild of storagelessGuilds.values())
			this._bot.storage.guilds.set(guild.id, await createGuildStorageMixin(
				dataStorage, settingsStorage, guild, this._bot));
	}

	/**
	 * Clean out any storages/settings storages for guilds the
	 * bot is no longer a part of
	 */
	public async cleanGuilds(dataStorage: StorageProvider, settingsStorage: StorageProvider): Promise<void>
	{
		const dataStorageKeys: string[] = await dataStorage.keys();
		const settingsStorageKeys: string[] = await settingsStorage.keys();
		let guildlessStorages: string[] = dataStorageKeys.filter(guild => !this._bot.guilds.has(guild));
		let guildlessSettings: string[] = settingsStorageKeys.filter(guild => !this._bot.guilds.has(guild));
		for (const settings of guildlessSettings) await settingsStorage.remove(settings);
		for (const storage of guildlessStorages)
		{
			this._bot.storage.guilds.delete(storage);
			await dataStorage.remove(storage);
		}
	}
}
