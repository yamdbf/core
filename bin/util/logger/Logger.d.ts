import { Transport } from '../../types/Transport';
import { LogLevel } from '../../types/LogLevel';
export { logger } from './LoggerDecorator';
/**
 * Singleton containing methods for asynchronous logging with clean,
 * configurable output via custom Logger transports
 *
 * Easiest manner of use is via the `@logger` parameter decorator
 * to attach the logger to a class property for use within that class.
 * Otherwise the singleton instance can be accessed via `Logger.instance()`
 *
 * Logging can be turned off by setting the logging level to `LogLevel.NONE`
 */
export declare class Logger {
    private static _instance;
    private _logLevel;
    private _transports;
    private _baseTransportRemoved;
    /**
     * Internal, set via Client at runtime if Client is running
     * in a shard process
     * @internal
     */
    static _shard: number;
    private constructor();
    /**
     * `LogLevel.NONE` enum shortcut
     * @type {LogLevel}
     */
    static readonly NONE: LogLevel;
    /**
     * `LogLevel.LOG` enum shortcut
     * @type {LogLevel}
     */
    static readonly LOG: LogLevel;
    /**
     * `LogLevel.INFO` enum shortcut
     * @type LogLevel
     */
    static readonly INFO: LogLevel;
    /**
     * `LogLevel.WARN` enum shortcut
     * @type {LogLevel}
     */
    static readonly WARN: LogLevel;
    /**
     * `LogLevel.ERROR` enum shortcut
     * @type {LogLevel}
     */
    static readonly ERROR: LogLevel;
    /**
     * `LogLevel.DEBUG` enum shortcut
     * @type LogLevel
     */
    static readonly DEBUG: LogLevel;
    /**
     * Returns the Logger singleton instance
     *
     * When given a tag parameter, a Logger proxy will be returned
     * that automatically applies the given tag to all logging methods
     * in lieu of them requiring a tag parameter before the log content
     * @param {string} [tag] Tag for this instance proxy
     * @returns {Logger}
     */
    static instance(tag?: string): Logger;
    /**
     * Returns an instance proxy that prefixes logging
     * method calls with the given tag
     * @private
     */
    private static taggedInstance;
    /**
     * Set the level of output that will be logged
     * @param {LogLevel} level The level of logging to output
     * @returns {void}
     */
    setLogLevel(level: LogLevel): void;
    /**
     * Add a {@link Transport} for the Logger to use for logging.
     * The logger will log to all provided transports
     * @param {Transport} transport The transport to add
     * @returns {void}
     */
    addTransport(transport: Transport): void;
    /**
     * Remove the default console logging transport. This is
     * useful if you want to provide your own transport that
     * uses the console.
     *
     * This should be run before creating a YAMDBF Client
     * instance if you do not want any logging to be done with
     * the base transport before you get the chance to swap it out.
     * ```
     * Logger.instance().removeBaseTransport();
     * Logger.instance().addTransport({ transport[, level] });
     * ```
     * @returns {void}
     */
    removeBaseTransport(): void;
    /**
     * Log useful information to the Logger transports. Will not be logged
     * unless the log level is `LogLevel.LOG` or higher
     * @param {string} tag Tag to prefix the log with
     * @param {...string} text String(s) to log
     * @returns {Promise<void>}
     */
    log(tag: string, ...text: string[]): Promise<void>;
    /**
     * Log less important information to the logger transports. Will not
     * be logged unless the logging level is `LogLevel.INFO` or higher
     * @param {string} tag Tag to prefix the log with to identify the
     * 					   source of the log
     * @param {...string} text String(s) to log
     * @returns {Promise<void>}
     */
    info(tag: string, ...text: string[]): Promise<void>;
    /**
     * Log warning text to the logger transports. Will not be logged
     * unless the logging level is `LogLevel.WARN` or higher
     * @param {string} tag Tag to prefix the log with
     * @param {...string} text String(s) to log
     * @returns {Promise<void>}
     */
    warn(tag: string, ...text: string[]): Promise<void>;
    /**
     * Log error text to the logger transports. Will not be logged
     * unless the logging level is `LogLevel.ERROR` or higher
     * @param {string} tag Tag to prefix the log with
     * @param {...string} text String(s) to log
     * @returns {Promise<void>}
     */
    error(tag: string, ...text: string[]): Promise<void>;
    /**
     * Log debug text to the logger transports. Will not be logged
     * unless the logging level is `LogLevel.DEBUG`
     * @param {string} tag Tag to prefix the log with
     * @param {...string} text String(s) to log
     * @returns {Promise<void>}
     */
    debug(tag: string, ...text: string[]): Promise<void>;
    /**
     * Send log data to all transports
     * @private
     */
    private _write;
}
