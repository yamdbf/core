import { Logger } from '../util/logger/Logger';
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
 * does not like having multiple connections
 */
export class Database
{
	private readonly logger: Logger = Logger.instance();
	private static _instance: Database;
	private _url: string;
	public db: Sequelize.Sequelize;
	private constructor(url: string)
	{
		if (Database._instance)
			throw new Error('Cannot create multiple instances of Database singleton. Use Database.instance() instead');
		Database._instance = this;
		this._url = url;

		/**
		 * The Sequelize connection to the database specified by
		 * your chosen storage provider
		 * @type {Sequelize}
		 */
		this.db = this.db ? this.db : new Sequelize(this._url, {
			logging: (...args: any[]) => this.logger.debug('SequelizeProvider', ...args) });
	}

	/**
	 * As long as a Sequelize-using storage provider is being used,
	 * this will return the Database instance holding the Sequelize
	 * connection to the database
	 * @param {string} [url] The database connection url
	 * @returns {Database}
	 */
	public static instance(url?: string): Database
	{
		if (!url && !Database._instance)
			throw new Error('A database url is needed the first time a Database is accessed.');

		if (this._instance) return this._instance;
		return new Database(url);
	}

	/**
	 * Authenticate the connection to the database
	 * @returns {Promise<void>}
	 */
	public async init(): Promise<void>
	{
		try { await this.db.authenticate(); }
		catch (err)
		{
			console.error(new Error(`Failed to connect to the database:\n${err}`));
			process.exit();
		}
	}
}
