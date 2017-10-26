import { SharedProviderStorage } from './SharedProviderStorage';
import { StorageProvider } from './StorageProvider';
import { GuildSettings } from './GuildSettings';
import { Client } from '../client/Client';
import { Guild } from 'discord.js';

/**
 * Class containing asynchronous methods for storing, retrieving, and
 * interacting with data for a specific guild
 * @borrows SharedProviderStorage#init as GuildStorage#init
 * @borrows SharedProviderStorage#keys as GuildStorage#keys
 * @borrows SharedProviderStorage#get as GuildStorage#get
 * @borrows SharedProviderStorage#set as GuildStorage#set
 * @borrows SharedProviderStorage#remove as GuildStorage#remove
 * @borrows SharedProviderStorage#clear as GuildStorage#clear
 */
export class GuildStorage extends SharedProviderStorage
{
	public readonly settings: GuildSettings;

	public constructor(client: Client, guild: Guild, storageProvider: StorageProvider, settingsProvider: StorageProvider)
	{
		super(storageProvider, guild.id);

		/**
		 * GuildSettings object containing settings for this guild
		 * @name GuildStorage#settings
		 * @type {GuildSettings}
		 */
		this.settings = new GuildSettings(client, guild, settingsProvider);
	}

	/**
	 * Initialize this storage instance
	 * @returns {Promise<void>}
	 */
	public async init(): Promise<void>
	{
		await super.init();
		await this.settings.init();
	}
}
