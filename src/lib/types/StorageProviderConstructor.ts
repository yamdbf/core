import { StorageProvider } from '../storage/StorageProvider';

export type StorageProviderConstructor = new (name: string) => StorageProvider;
