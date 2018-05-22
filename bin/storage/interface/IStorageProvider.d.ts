/**
 * Interface for storage providers to implement, providing compile-time
 * errors for incorrect implementations alongside the abstract StorageProvider
 * class to extend which provides runtime errors for missing method implementations
 *
 * >**Note:** This is a TypeScript feature and you do not need to worry about this bit so much
 * if you are using JavaScript.
 * @interface IStorageProvider
 */
/**
 * Async method to be run that will set up the storage provider
 * for use. Calls to other provider methods should not be made
 * until this method has been called and resolved
 * @method IStorageProvider#init
 * @returns {Promise<void>}
 */
/**
 * Async method returning an array of stored key names
 * @method IStorageProvider#keys
 * @returns {Promise<string[]>}
 */
/**
 * Async method that gets the value of a key in storage,
 * returning undefined if a value doesn't exist
 * @method IStorageProvider#get
 * @param {string} key The name of the key in storage
 * @returns {Promise<string | undefined>}
 */
/**
 * Async method that sets the value of a key in storage
 * @method IStorageProvider#set
 * @param {string} key The name of the key in storage
 * @param {string} value The value to set in storage
 * @returns {Promise<void>}
 */
/**
 * Async method that removes a key and its value from storage
 * @method IStorageProvider#remove
 * @param {string} key The name of the key in storage
 * @returns {Promise<void>}
 */
/**
 * Async method that removes all keys and their values from storage
 * @method IStorageProvider#clear
 * @returns {Promise<void>}
 */
export interface IStorageProvider {
    init(): Promise<void>;
    keys(): Promise<string[]>;
    get(key: string): Promise<string | undefined>;
    set(key: string, value: string): Promise<void>;
    remove(key: string): Promise<void>;
    clear(): Promise<void>;
}
