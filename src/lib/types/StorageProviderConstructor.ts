/**
 * @typedef {Function} StorageProviderConstructor Any class that extends and implements {@link StorageConstructor}
 * and provides an interface with a storage medium allowing data to be stored, retrieved, and manipulated. <i>Not
 * to be confused with an <b>instance</b> of a storage provider.</i>
 */

import { StorageProvider } from '../storage/StorageProvider';

export type StorageProviderConstructor = new (name: string) => StorageProvider;
