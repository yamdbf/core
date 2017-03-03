import { GuildStorage } from './GuildStorage';
import { LocalStorage } from './LocalStorage';
import { Collection, Guild } from 'discord.js';
import { Bot } from '../bot/Bot';

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
	public loadStorages(dataStorage: LocalStorage, settingsStorage: LocalStorage): void
	{
		dataStorage.keys.forEach((key) =>
		{
			this._bot.guildStorages.set(key, new GuildStorage(this._bot, key, dataStorage, settingsStorage));
		});

		this.initNewGuilds(dataStorage, settingsStorage);
	}

	/**
	 * Assign a GuildStorage to guilds that lack one due to the bot being
	 * in the guild before adopting this storage spec or the bot being
	 * added to a new guild
	 */
	public initNewGuilds(dataStorage: LocalStorage, settingsStorage: LocalStorage): void
	{
		let storagelessGuilds: Collection<string, Guild> = this._bot.guilds.filter(guild => !dataStorage.keys.includes(guild.id));
		storagelessGuilds.forEach(guild =>
		{
			this._bot.guildStorages.set(guild.id, new GuildStorage(this._bot, guild.id, dataStorage, settingsStorage));
		});
	}

	/**
	 * Clean out any storages/settings storages for guilds the
	 * bot is no longer a part of
	 */
	public cleanGuilds(dataStorage: LocalStorage, settingsStorage: LocalStorage): void
	{
		let guildlessStorages: string[] = dataStorage.keys.filter(guild => !this._bot.guilds.has(guild));
		let guildlessSettings: string[] = settingsStorage.keys.filter(guild => !this._bot.guilds.has(guild));
		guildlessSettings.forEach(settings => settingsStorage.removeItem(settings));
		guildlessStorages.forEach(storage =>
		{
			this._bot.guildStorages.delete(storage);
			dataStorage.removeItem(storage);
		});
	}
}
