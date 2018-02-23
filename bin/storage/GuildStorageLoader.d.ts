import { Client } from '../client/Client';
/**
 * Handles loading all guild-specific data from persistent storage into
 * {@link GuildStorage} objects
 * @private
 */
export declare class GuildStorageLoader {
    private readonly _client;
    private readonly _storageProvider;
    private readonly _settingsProvider;
    constructor(client: Client);
    /**
     * Initialize storage providers for guild storage and settings
     * @returns {Promise<void>}
     */
    init(): Promise<void>;
    /**
     * Load data for each guild from persistent storage and store it in a
     * {@link GuildStorage} object
     * @returns {Promise<void>}
     */
    loadStorages(): Promise<void>;
    /**
     * Clean out any storages/settings storages for guilds the
     * bot has no longer been a part of for more than 7 days
     * @returns {Promise<void>}
     */
    cleanGuilds(): Promise<void>;
}
