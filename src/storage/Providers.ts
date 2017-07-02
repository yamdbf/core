import { StorageProviderConstructor } from '../types/StorageProviderConstructor';
import { PostgresProvider } from './PostgresProvider';

/**
 * Contains static factory methods for creating StorageProviders
 * that require extra data to operate
 * @module Providers
 */
export class Providers
{
	/**
	 * Factory method that returns a StorageProvider class for
	 * a Postgres database via the given Postgres url
	 * @static
	 * @method PostgresProvider
	 * @param {string} url Postgres database url
	 * @returns {StorageProviderConstructor}
	 */
	public static PostgresProvider: (url: string) => StorageProviderConstructor = PostgresProvider;
}
