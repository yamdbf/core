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
export declare class GuildStorage extends SharedProviderStorage {
    readonly settings: GuildSettings;
    constructor(client: Client, guild: Guild, storageProvider: StorageProvider, settingsProvider: StorageProvider);
    /**
     * Initialize this storage instance
     * @returns {Promise<void>}
     */
    init(): Promise<void>;
}
