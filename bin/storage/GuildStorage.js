"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SharedProviderStorage_1 = require("./SharedProviderStorage");
const GuildSettings_1 = require("./GuildSettings");
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
class GuildStorage extends SharedProviderStorage_1.SharedProviderStorage {
    constructor(client, guild, storageProvider, settingsProvider) {
        super(storageProvider, guild.id);
        /**
         * GuildSettings object containing settings for this guild
         * @name GuildStorage#settings
         * @type {GuildSettings}
         */
        this.settings = new GuildSettings_1.GuildSettings(client, guild, settingsProvider);
    }
    /**
     * Initialize this storage instance
     * @returns {Promise<void>}
     */
    async init() {
        await super.init();
        await this.settings.init();
    }
}
exports.GuildStorage = GuildStorage;

//# sourceMappingURL=GuildStorage.js.map
