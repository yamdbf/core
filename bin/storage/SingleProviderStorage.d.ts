import { StorageProviderConstructor } from '../types/StorageProviderConstructor';
/**
 * Simple async key/value storage abstraction operating on top of
 * a single StorageProvider instance. Each key in this storage
 * reflects a single key in the given StorageProvider
 *
 * >Supports nested object paths in get/set/remove using `.`
 * like normal object accessors
 * @param {string} name Unique identifier for this storage, used by the given StorageProvider
 * @param {StorageProviderConstructor} provider The storage provider class that will be instantiated
 * 												and used as the backend for this storage abstraction
 */
export declare class SingleProviderStorage {
    private readonly _storage;
    constructor(name: string, provider: StorageProviderConstructor);
    /**
     * Initialize this storage. Any other method calls should not be made
     * until this method has been called and resolved
     * @returns {Promise<void>}
     */
    init(): Promise<void>;
    /**
     * Get the names of all keys in this storage
     * @returns {Promise<string[]>}
     */
    keys(): Promise<string[]>;
    /**
     * Get a value from this storage for the specified key
     * @param {string} key The key in storage to get
     * @returns {Promise<any>}
     */
    get(key: string): Promise<any>;
    /**
     * Check if a value exists in storage
     * @param {string} key The key in storage to check
     * @returns {Promise<boolean>}
     */
    exists(key: string): Promise<boolean>;
    /**
     * Set a value in this storage for the specified key
     * @param {string} key The key in storage to set
     * @param {any} value The value to set
     * @returns {Promise<void>}
     */
    set(key: string, value: any): Promise<void>;
    /**
     * Remove a key/value pair from this storage
     * @param {string} key The key in storage to remove
     * @returns {Promise<void>}
     */
    remove(key: string): Promise<void>;
    /**
     * Remove all key/value pairs from this storage
     * @returns {Promise<void>}
     */
    clear(): Promise<void>;
}
