import { SingleProviderStorage } from './SingleProviderStorage';
import { GuildStorage } from './GuildStorage';
import { Client } from '../client/Client';
import { Collection } from 'discord.js';
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
export declare class ClientStorage extends SingleProviderStorage {
    readonly guilds: Collection<string, GuildStorage>;
    constructor(client: Client);
}
