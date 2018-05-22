import { Logger, logger } from '../util/logger/Logger';
import * as Sequelize from 'sequelize';

/**
 * >**Note:** This won't do anything for you if you're not using
 * a `StorageProvider` for your client that uses Sequelize
 *
 * Holds the Sequelize connection to whichever database backend
 * is chosen via the Client StorageProvider. As long as you wait
 * until `clientReady` you can safely use {@link Database.instance}
 * to get the Database instance and access the Sequelize connection
 * via {@link Database#db}
 *
 * This will allow you to define and access your own Sequelize Models
 * without having to create another database connection. This is
 * especially important when using `SQLiteProvider` as SQLite
 * does not like having multiple connections to an sqlite file
 */
export class Database
{
	@logger('Database')
	private readonly _logger!: Logger;
	private static _instance: Database;
	private _url: string;

	public db: Sequelize.Sequelize;

	private constructor(url: string, debug: boolean)
	{
		if (Database._instance)
			throw new Error('Cannot create multiple instances of Database singleton. Use Database.instance() instead');

		Database._instance = this;
		this._url = url;

		// Lazy load sequelize
		const seq: typeof Sequelize = require('sequelize');
		const logging: (...args: any[]) => void =
			(...args) => { if (debug) this._logger.debug(args[0], ...args.slice(1)); };

		/**
		 * The Sequelize connection to the database specified by
		 * your chosen storage provider
		 * @type {Sequelize}
		 */
		this.db = new seq(this._url, { logging });
	}

	/**
	 * **(Static)** The Sequelize connection to the database
	 * specified by your chosen storage provider.
	 *
	 * >**WARNING:** Accessing this before the client has created
	 * the singleton instance will throw an error. To be safe,
	 * wait until `clientReady` before accessing the Database
	 * connection
	 * @type {Sequelize}
	 */
	public static get db(): Sequelize.Sequelize
	{
		return Database.instance().db;
	}

	/**
	 * As long as a Sequelize-using storage provider is being used,
	 * this will return the Database instance holding the Sequelize
	 * connection to the database.
	 *
	 * Parameters are not needed and will be passed internally by
	 * the framework when the Database singleton is created before
	 * `clientReady` is emitted.
	 *
	 * >**WARNING:** Accessing this before the client has created
	 * the singleton instance will throw an error. To be safe,
	 * wait until `clientReady` before accessing the Database
	 * connection
	 * @param {string} [url] The database connection url
	 * @param {boolean} [debug=false] Whether or not to log Database debug info
	 * @returns {Database}
	 */
	public static instance(url?: string, debug: boolean = false): Database
	{
		if (!url && !Database._instance)
			throw new Error('A database url is needed the first time a Database is accessed.');

		if (this._instance) return this._instance;
		return new Database(url!, debug);
	}

	/**
	 * Authenticate the connection to the database. This is called
	 * internally by the framework
	 * @returns {Promise<void>}
	 */
	public async init(): Promise<void>
	{
		try { await this.db.authenticate(); }
		catch (err)
		{
			await this._logger.error(`Failed to connect to the database:\n${err}`);
			process.exit();
		}
	}
}
