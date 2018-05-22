"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SharedProviderStorage_1 = require("./SharedProviderStorage");
const Logger_1 = require("../util/logger/Logger");
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
class GuildSettings extends SharedProviderStorage_1.SharedProviderStorage {
    constructor(client, guild, storage) {
        super(storage, guild.id);
        this._client = client;
    }
    /**
     * Initialize this storage instance
     * @returns {Promise<void>}
     */
    async init() {
        try {
            await super.init();
            let raw = (await this._provider.get(this._key));
            let data = JSON.parse(raw);
            const defaults = await this._client.storage.get('defaultGuildSettings');
            for (const key of Object.keys(defaults))
                if (typeof data[key] === 'undefined')
                    data[key] = defaults[key];
            await this._provider.set(this._key, JSON.stringify(data));
            this._cache = data;
        }
        catch (err) {
            Logger_1.Logger.instance().error('GuildSettings', err.stack);
        }
    }
}
exports.GuildSettings = GuildSettings;

//# sourceMappingURL=GuildSettings.js.map
