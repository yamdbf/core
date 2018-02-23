import { SharedProviderStorage } from './SharedProviderStorage';
import { Guild } from 'discord.js';
import { StorageProvider } from './StorageProvider';
import { Client } from '../client/Client';
/**
 * Class containing asynchronous methods for storing, retrieving, and
 * interacting with settings for a specific guild. Will be contained
 * under {@link GuildStorage#settings}
 * @borrows SharedProviderStorage#keys as GuildSettings#keys
 * @borrows SharedProviderStorage#get as GuildSettings#get
 * @borrows SharedProviderStorage#set as GuildSettings#set
 * @borrows SharedProviderStorage#remove as GuildSettings#remove
 * @borrows SharedProviderStorage#clear as GuildSettings#clear
 */
export declare class GuildSettings extends SharedProviderStorage {
    private readonly _client;
    constructor(client: Client, guild: Guild, storage: StorageProvider);
    /**
     * Initialize this storage instance
     * @returns {Promise<void>}
     */
    init(): Promise<void>;
}
