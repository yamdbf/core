import { StorageProvider } from './StorageProvider';
/**
 * Simple async key/value storage abstraction operating on top
 * of a single key within the given StorageProvider instance.
 * As the name suggests, the given StorageProvider instance
 * can be shared between multiple SharedProviderStorage instances
 *
 * >Supports nested object paths in get/set/remove using `.`
 * like normal object accessors
 *
 * >**Note:** The storage provider given to the constructor should
 * already be initialized via its `init()` method
 */
export declare class SharedProviderStorage {
    protected readonly _provider: StorageProvider;
    protected readonly _key: string;
    protected _cache: {
        [key: string]: any;
    };
    constructor(storage: StorageProvider, key: string);
    /**
     * Initialize this storage instance
     * @returns {Promise<void>}
     */
    init(): Promise<void>;
    /**
     * Get the names of all keys in this storage for this instance
     * @returns {Promise<string[]>}
     */
    keys(): Promise<string[]>;
    /**
     * Get a value from storage for this instance
     * @param {string} key The key in storage to get
     * @returns {Promise<any>}
     */
    get(key: string): Promise<any>;
    /**
     * Check if a value exists in storage for this instance
     * @param {string} key The key in storage to check
     * @returns {Promise<boolean>}
     */
    exists(key: string): Promise<boolean>;
    /**
     * Set a value in storage for this instance
     * @param {string} key The key in storage to set
     * @param {any} value The value to set
     * @returns {Promise<void>}
     */
    set(key: string, value: any): Promise<void>;
    /**
     * Remove a value from storage for this instance
     * @param {string} key The key in storage to remove
     * @returns {Promise<void>}
     */
    remove(key: string): Promise<void>;
    /**
     * Remove all key/value pairs from storage for this instance
     * @returns {Promise<void>}
     */
    clear(): Promise<void>;
}
