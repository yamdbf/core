import { IStorageProvider } from './interface/IStorageProvider';

/**
 * Abstract class for storage providers to extend. Provides runtime errors
 * for missing method implementations, and is necessary at compile-time
 * for the compiler to recognize a StorageProvider as valid.
 * <br><br>
 * StorageProviders must present an interface with a storage solution that
 * provides access to string values via string keys. Data will be stored
 * in the storage solution by the framework as stringified JSON-valid data
 * <br><br>
 * <b>Note:</b> All methods shown on this class must be implemented within
 * any storage providers you create and, in the case of <code>keys()</code>
 * and <code>get()</code>, <b>must</b> return the proper data types or your
 * client <b>will not work</b>.
 * @abstract
 * @class StorageProvider
 * @implements IStorageProvider
 * @param {string} name Name of the storage to access. Can be a DB table, file name, etc. Whatever the storage solution expects
 *						with regards to providing a unique identifier for a specific storage.<br><br><b>Note:</b> This does not need to be
 *						passed to <code>super()</code> in classes extending <code>StorageProvider</code> as <code>StorageProvider</code>
 *						is abstract and provides no implementation, but should be received by and used within your storage provider
 *						constructors as necessary to create a unique storage based on the given string
 */
export class StorageProvider implements IStorageProvider
{
	public async init(): Promise<void> { throw new Error('Storage providers must implement the `init` method'); }
	public async keys(): Promise<string[]> { throw new Error('Storage providers must implement the `keys` method'); }
	public async get(key: string): Promise<string> { throw new Error('Storage providers must implement the `get` method'); }
	public async set(key: string, value: string): Promise<void> { throw new Error('Storage providers must implement the `set` method'); }
	public async remove(key: string): Promise<void> { throw new Error('Storage providers must implement the `remove` method'); }
	public async clear(): Promise<void> { throw new Error('Storage providers must implement the `clear` method'); }
}
