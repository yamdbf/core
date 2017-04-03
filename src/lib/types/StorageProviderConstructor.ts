/**
 * @typedef {Function} StorageProviderConstructor Any class that extends and
 * implements {@link StorageProvider} and provides an interface with a storage
 * medium allowing data to be stored, retrieved, and manipulated. *Not
 * to be confused with an **instance** of a storage provider.*
 */

import { StorageProvider } from '../storage/StorageProvider';

export type StorageProviderConstructor = new (name: string) => StorageProvider;
