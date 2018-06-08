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
export declare class Database {
    private readonly _logger;
    private static _instance;
    private _url;
    db: Sequelize.Sequelize;
    private constructor();
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
    static readonly db: Sequelize.Sequelize;
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
    static instance(url?: string, debug?: boolean): Database;
    /**
     * Authenticate the connection to the database. This is called
     * internally by the framework
     * @returns {Promise<void>}
     */
    init(): Promise<void>;
}
