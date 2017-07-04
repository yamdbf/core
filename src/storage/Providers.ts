import { StorageProviderConstructor } from '../types/StorageProviderConstructor';
import { SequelizeProvider, Dialect } from './SequelizeProvider';
import { JSONProvider } from './JSONProvider';

/**
 * Contains static storage providers and static factory methods
 * for storage providers that require extra data to operate.
 *
 * Be sure to install the necessary peer dependencies if using
 * a storage provider that necessitates them
 * @module Providers
 */
export class Providers
{
	/**
	 * Factory method that returns a StorageProvider class for
	 * a Postgres database via the given Postgres url. The given
	 * url should follow the format:
	 * ```
	 * postgres://username:password@hostname:port/dbname
	 * ```
	 *
	 * >**Note:** Requires `pg` and `sequelize` peer dependencies
	 * @static
	 * @method PostgresProvider
	 * @param {string} url Postgres database url
	 * @returns {StorageProviderConstructor}
	 */
	public static PostgresProvider: (url: string) => StorageProviderConstructor =
		(url: string) => SequelizeProvider(url, Dialect.Postgres);

	/**
	 * Factory method that returns a StorageProvider class for
	 * an SQLite database via the given SQLite filepath.
	 * The given path should be prefixed with `sqlite://`
	 *
	 * >**Note:** Requires `sqlite3` and `sequelize` peer dependencies
	 * @static
	 * @method SQLiteProvider
	 * @param {string} path SQLite file path
	 * @returns {StorageProviderConstructor}
	 */
	public static SQLiteProvider: (path: string) => StorageProviderConstructor =
		(path: string) => SequelizeProvider(path, Dialect.SQLite);

	/**
	 * Default storage provider for the framework. If no storage provider is passed
	 * in the client constructor, this provider will be used
	 * @static
	 * @name JSONProvider
	 * @type {StorageProviderConstructor}
	 */
	public static JSONProvider: StorageProviderConstructor = JSONProvider;
}
