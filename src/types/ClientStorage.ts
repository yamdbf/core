/**
 * @classdesc Class containing asynchronous methods for storing, retrieving, and
 * interacting with data specific to the Client instance. Can not be
 * created directly via a constructor due to mixin mechanics.
 * Created internally via `StorageFactory#createClientStorage`
 * @class ClientStorage
 * @mixes KeyedStorage
 * @borrows KeyedStorage#init as ClientStorage#init
 * @borrows KeyedStorage#keys as ClientStorage#keys
 * @borrows KeyedStorage#get as ClientStorage#get
 * @borrows KeyedStorage#set as ClientStorage#set
 * @borrows KeyedStorage#remove as ClientStorage#remove
 * @borrows KeyedStorage#clear as ClientStorage#clear
 */
/**
 * Collection mapping Guild IDs to GuildStorages
 * @name ClientStorage#guilds
 * @type {external:Collection<string, GuildStorage>}
 */

import { KeyedStorage } from '../storage/KeyedStorage';
import { Collection } from 'discord.js';
import { GuildStorage } from '../storage/GuildStorage';

export type ClientStorage = KeyedStorage & { guilds: Collection<string, GuildStorage>; };
