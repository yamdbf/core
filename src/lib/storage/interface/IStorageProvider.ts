/**
 * Interface for storage providers to implement, providing compile-time
 * errors for incorrect implementations alongside the abstract StorageProvider
 * class to extend which provides runtime errors for missing method implementations
 * <br><br>
 * <b>Note:</b> This is a TypeScript feature and you do not need to worry about this bit so much
 * if you are using JavaScript.
 * @interface IStorageProvider
 */
/**
 * Async method to be run that will set up the storage provider
 * for use. Calls to other provider methods should not be made
 * until this method has been called and resolved
 * @name IStorageProvider#init
 * @method
 * @returns {Promise<void>}
 */
/**
 * Async method returning an array of stored key names
 * @name IStorageProvider#keys
 * @method
 * @returns {Promise<string[]>}
 */
/**
 * Async method that gets the value of a key in storage
 * @name IStorageProvider#get
 * @method
 * @param {string} key The name of the key in storage
 * @returns {Promise<string>}
 */
/**
 * Async method that sets the value of a key in storage
 * @name IStorageProvider#set
 * @method
 * @param {string} key The name of the key in storage
 * @param {string} value The value to set in storage
 * @returns {Promise<void>}
 */
/**
 * Async method that removes a key and its value from storage
 * @name IStorageProvider#remove
 * @method
 * @param {string} key The name of the key in storage
 * @returns {Promise<void>}
 */
/**
 * Async method that removes all keys and their values from storage
 * @name IStorageProvider#clear
 * @method
 * @returns {Promise<void>}
 */

export interface IStorageProvider
{
	init(): Promise<void>;
	keys(): Promise<string[]>;
	get(key: string): Promise<string>;
	set(key: string, value: string): Promise<void>;
	remove(key: string): Promise<void>;
	clear(): Promise<void>;
}
