"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Abstract class for storage providers to extend. Provides runtime errors
 * for missing method implementations, and is necessary at compile-time
 * when using TypeScript for the compiler to recognize a StorageProvider
 * as valid.
 *
 * StorageProviders must present an interface with a storage solution that
 * provides access to string values via string keys. Data will be stored
 * in the storage solution by the framework as stringified JSON-valid data
 *
 * >**Note:** All methods shown on this class must be implemented within
 * any storage providers you create and, in the case of `keys()`
 * and `get()`, **must** return the proper data types or your
 * client **will not work**.
 * @abstract
 * @implements IStorageProvider
 * @param {string} name Name of the storage to access. Can be a DB table, file name, etc.
 * Whatever the storage solution expects with regards to providing a unique identifier
 * for a specific storage.
 *
 * >**Note:** This does not need to be passed to `super()` in classes extending `StorageProvider`
 * as `StorageProvider` is abstract and provides no implementation, but should be received
 * by and used within your storage provider constructors as necessary to create a unique
 * storage based on the given string
 */
class StorageProvider {
}
exports.StorageProvider = StorageProvider;

//# sourceMappingURL=StorageProvider.js.map
