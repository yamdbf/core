"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const GuildStorage_1 = require("../storage/GuildStorage");
const Util_1 = require("../util/Util");
/**
 * Handles loading all guild-specific data from persistent storage into
 * {@link GuildStorage} objects
 * @private
 */
class GuildStorageLoader {
    constructor(client) {
        this._client = client;
        this._storageProvider = new this._client.provider('guild_storage');
        this._settingsProvider = new this._client.provider('guild_settings');
    }
    /**
     * Initialize storage providers for guild storage and settings
     * @returns {Promise<void>}
     */
    async init() {
        await this._storageProvider.init();
        await this._settingsProvider.init();
    }
    /**
     * Load data for each guild from persistent storage and store it in a
     * {@link GuildStorage} object
     * @returns {Promise<void>}
     */
    async loadStorages() {
        for (const guild of this._client.guilds.values()) {
            if (this._client.storage.guilds.has(guild.id))
                continue;
            const storage = new GuildStorage_1.GuildStorage(this._client, guild, this._storageProvider, this._settingsProvider);
            await storage.init();
            // Handle guild returning, possibly in a new shard or a new session
            if (await storage.settings.exists('YAMDBFInternal.remove'))
                await storage.settings.remove('YAMDBFInternal.remove');
            this._client.storage.guilds.set(guild.id, storage);
        }
    }
    /**
     * Clean out any storages/settings storages for guilds the
     * bot has no longer been a part of for more than 7 days
     * @returns {Promise<void>}
     */
    async cleanGuilds() {
        const settingsStorageKeys = await this._settingsProvider.keys();
        for (const guildID of settingsStorageKeys) {
            const data = (await this._settingsProvider.get(guildID));
            if (!data)
                continue;
            const parsed = JSON.parse(data);
            const removeTime = Util_1.Util.getNestedValue(parsed, ['YAMDBFInternal', 'remove']);
            if (!removeTime)
                continue;
            if (removeTime < Date.now()) {
                await this._settingsProvider.remove(guildID);
                await this._storageProvider.remove(guildID);
                if (this._client.storage.guilds.has(guildID))
                    this._client.storage.guilds.delete(guildID);
            }
        }
    }
}
exports.GuildStorageLoader = GuildStorageLoader;

//# sourceMappingURL=GuildStorageLoader.js.map
