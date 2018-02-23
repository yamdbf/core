"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SingleProviderStorage_1 = require("./SingleProviderStorage");
const discord_js_1 = require("discord.js");
/**
 * Class containing asynchronous methods for storing, retrieving, and
 * interacting with data specific to the Client instance, and for
 * accessing guild storages/settings
 * @borrows SingleProviderStorage#init as ClientStorage#init
 * @borrows SingleProviderStorage#keys as ClientStorage#keys
 * @borrows SingleProviderStorage#get as ClientStorage#get
 * @borrows SingleProviderStorage#set as ClientStorage#set
 * @borrows SingleProviderStorage#remove as ClientStorage#remove
 * @borrows SingleProviderStorage#clear as ClientStorage#clear
 */
class ClientStorage extends SingleProviderStorage_1.SingleProviderStorage {
    constructor(client) {
        super('client_storage', client.provider);
        /**
         * Collection mapping Guild IDs to GuildStorages
         * @name ClientStorage#guilds
         * @type {external:Collection<string, GuildStorage>}
         */
        this.guilds = new discord_js_1.Collection();
    }
}
exports.ClientStorage = ClientStorage;

//# sourceMappingURL=ClientStorage.js.map
