/**
 * @classdesc Class containing asynchronous methods for storing, retrieving, and
 * interacting with data for a specific guild. Can not be created directly
 * via a constructor due to mixin mechanics. Created internally via
 * `StorageFactory#createGuildStorage`
 * @class GuildStorage
 * @mixes GuildSettings
 * @borrows GuildSettings#init as GuildStorage#init
 * @borrows GuildSettings#keys as GuildStorage#keys
 * @borrows GuildSettings#get as GuildStorage#get
 * @borrows GuildSettings#set as GuildStorage#set
 * @borrows GuildSettings#remove as GuildStorage#remove
 * @borrows GuildSettings#clear as GuildStorage#clear
 */
/**
 * GuildSettings object containing settings for this guild
 * @name GuildStorage#settings
 * @type {GuildSettings}
 */

import { GuildSettings } from '../storage/GuildSettings';

export type GuildStorage = GuildSettings & { settings: GuildSettings };
