import { StorageProviderConstructor } from '../types/StorageProviderConstructor';
import { PostgresProvider } from './PostgresProvider';
import { JSONProvider } from './JSONProvider';

/**
 * Contains static storage providers and static factory methods
 * for storage providers that require extra data to operate
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

	/**
	 * Default storage provider for the framework. If no storage provider is passed
	 * in the client constructor, this provider will be used
	 * @static
	 * @name JSONProvider
	 * @type {StorageProviderConstructor}
	 */
	public static JSONProvider: StorageProviderConstructor = JSONProvider;
}
