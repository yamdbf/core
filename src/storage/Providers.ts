import { StorageProviderConstructor } from '../types/StorageProviderConstructor';
import { SequelizeProvider, Dialect } from './SequelizeProvider';
import { JSONProvider } from './JSONProvider';

/**
 * Contains static storage providers and static factory methods
 * for storage providers that require extra data to operate.
 *
 * Be sure to install the necessary peer dependencies if using
 * a storage provider that necessitates them.
 *
 * >**Note:** PostgresProvider and SQLiteProvider are mutually
 * exclusive. You cannot use one while using the other as they
 * utilize a singleton to maintain a shared Database connection
 * between all Provider instances with a Sequelize backend
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
	public static PostgresProvider: (url: string, debug?: boolean) => StorageProviderConstructor =
		(url, debug = false) => SequelizeProvider(url, Dialect.Postgres, debug);

	/**
	 * Factory method that returns a StorageProvider class for
	 * an MSSQL database via the given MSSQL url. The given
	 * url should follow the format:
	 * ```
	 * mssql://username:password@hostname:port/dbname
	 * ```
	 *
	 * >**Note:** Requires `tedious` and `sequelize` peer dependencies
	 * @static
	 * @method MSSQLProvider
	 * @param {string} url MSSQL database url
	 * @returns {StorageProviderConstructor}
	 */
	public static MSSQLProvider: (url: string, debug?: boolean) => StorageProviderConstructor =
		(url, debug = false) => SequelizeProvider(url, Dialect.MSSQL, debug);

	/**
	 * Factory method that returns a StorageProvider class for
	 * an MySQL database via the given MySQL url. The given
	 * url should follow the format:
	 * ```
	 * mysql://username:password@hostname:port/dbname
	 * ```
	 *
	 * >**Note:** Requires `mysql2` and `sequelize` peer dependencies
	 * @static
	 * @method MySQLProvider
	 * @param {string} url MySQL database url
	 * @returns {StorageProviderConstructor}
	 */
	public static MySQLProvider: (url: string, debug?: boolean) => StorageProviderConstructor =
		(url, debug = false) => SequelizeProvider(url, Dialect.MySQL, debug);

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
	public static SQLiteProvider: (path: string, debug?: boolean) => StorageProviderConstructor =
		(path, debug = false) => SequelizeProvider(path, Dialect.SQLite, debug);

	/**
	 * Default storage provider for the framework. If no storage provider is passed
	 * in the client constructor, this provider will be used
	 * @static
	 * @name JSONProvider
	 * @type {StorageProviderConstructor}
	 */
	public static JSONProvider: StorageProviderConstructor = JSONProvider;
}
