import { TransportFunction } from '../../types/TransportFunction';
import { Transport } from '../../types/Transport';
import { LogLevel } from '../../types/LogLevel';
import { LogData } from '../../types/LogData';
import { LogType } from './LogType';
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
export class Logger
{
	private static _instance: Logger;
	private _logLevel: LogLevel;
	private _transports: Transport[];
	private constructor()
	{
		if (Logger._instance)
			throw new Error('Cannot create multiple instances of Logger singleton. Use Logger.instance() instead');

		Logger._instance = this;
		this._logLevel = LogLevel.DEBUG;
		this._transports = [];

		// Create and add base transport

		type Color = [number, number];
		const colors: { [name: string]: Color } = {
			red: [31, 39],
			green: [32, 39],
			yellow: [33, 39],
			blue: [34, 39],
			magenta: [35, 39],
			cyan: [36, 39],
			grey: [90, 39]
		};

		function wrapColor(c: Color, ...text: string[]): string
		{
			return `\u001B[${c[0]}m${text.join(' ')}\u001B[${c[1]}m`;
		}

		type ColorWrapper = (...text: string[]) => string;
		function createWrapper(color: Color): ColorWrapper
		{
			return (...text: string[]) => wrapColor(color, ...text);
		}

		type LogTypeColorWrappers = { [type: string]: ColorWrapper };
		const typeColorWrappers: LogTypeColorWrappers = {
			[LogType.LOG]: createWrapper(colors.green),
			[LogType.INFO]: createWrapper(colors.blue),
			[LogType.WARN]: createWrapper(colors.yellow),
			[LogType.ERROR]: createWrapper(colors.red),
			[LogType.DEBUG]: createWrapper(colors.magenta)
		};

		const transport: TransportFunction = data => {
			let { type, tag, text } = data;
			const d: Date = data.timestamp;
			const hours: number = d.getHours();
			const minutes: number = d.getMinutes();
			const seconds: number = d.getSeconds();
			const timestamp: string = wrapColor(colors.grey, `${
				hours < 10 ? `0${hours}` : hours}:${
				minutes < 10 ? `0${minutes}` : minutes}:${
				seconds < 10 ? `0${seconds}` : seconds}`);

			type = typeColorWrappers[type](type);
			tag = wrapColor(colors.cyan, tag);

			process.stdout.write(`[${timestamp}][${type}][${tag}]: ${text}\n`);
		};

		this.addTransport({ transport });

	}

	/**
	 * `LogLevel.NONE` enum shortcut
	 * @type {LogLevel}
	 */
	public static readonly NONE: LogLevel = LogLevel.NONE;

	/**
	 * `LogLevel.LOG` enum shortcut
	 * @type {LogLevel}
	 */
	public static readonly LOG: LogLevel = LogLevel.LOG;

	/**
	 * `LogLevel.INFO` enum shortcut
	 * @type LogLevel
	 */
	public static readonly INFO: LogLevel = LogLevel.INFO;

	/**
	 * `LogLevel.WARN` enum shortcut
	 * @type {LogLevel}
	 */
	public static readonly WARN: LogLevel = LogLevel.WARN;

	/**
	 * `LogLevel.ERROR` enum shortcut
	 * @type {LogLevel}
	 */
	public static readonly ERROR: LogLevel = LogLevel.ERROR;

	/**
	 * `LogLevel.DEBUG` enum shortcut
	 * @type LogLevel
	 */
	public static readonly DEBUG: LogLevel = LogLevel.DEBUG;

	/**
	 * Returns the Logger singleton instance
	 * @returns {Logger}
	 */
	public static instance(): Logger
	{
		if (!Logger._instance) return new Logger();
		else return Logger._instance;
	}

	/**
	 * Set the level of output that will be logged
	 * @param {LogLevel} level The level of logging to output
	 * @returns {void}
	 */
	public setLogLevel(level: LogLevel): void
	{
		this._logLevel = level;
	}

	/**
	 * Add a {@link Transport} for the Logger to use for logging.
	 * The logger will log to all provided transports
	 * @param {Transport} transport The transport to add
	 * @returns {void}
	 */
	public addTransport(transport: Transport): void
	{
		const level: LogLevel | (() => LogLevel) = transport.level;
		transport.level = typeof level !== 'undefined'
			? typeof level === 'function'
				? level
				: () => <LogLevel> level
			: () => this._logLevel;

		this._transports.push(transport);
	}

	/**
	 * Remove the default console logging transport. This is
	 * useful if you want to provide your own transport that
	 * uses the console.
	 *
	 * This should be run before creating a YAMDBF Client
	 * instance if you do not any logging to be done with the
	 * base transport before you get the chance to swap it out.
	 * ```
	 * Logger.instance().removeBaseTransport();
	 * Logger.instance().addTransport({ transport[, level] });
	 * ```
	 * @returns {void}
	 */
	public removeBaseTransport(): void
	{
		this._transports.shift();
	}

	/**
	 * Log useful information to the Logger transports. Will not be logged
	 * unless the log level is `LogLevel.LOG` or higher
	 * @param {string} tag Tag to prefix the log with
	 * @param {...string} text String(s) to log
	 * @returns {Promise<void>}
	 */
	public async log(tag: string, ...text: string[]): Promise<void>
	{
		this._write(LogLevel.LOG, LogType.LOG, tag, text.join(' '));
	}

	/**
	 * Log less important information to the logger transports. Will not
	 * be logged unless the logging level is `LogLevel.INFO` or higher
	 * @param {string} tag Tag to prefix the log with to identify the
	 * 					   source of the log
	 * @param {...string} text String(s) to log
	 * @returns {Promise<void>}
	 */
	public async info(tag: string, ...text: string[]): Promise<void>
	{
		this._write(LogLevel.INFO, LogType.INFO, tag, text.join(' '));
	}

	/**
	 * Log warning text to the logger transports. Will not be logged
	 * unless the logging level is `LogLevel.WARN` or higher
	 * @param {string} tag Tag to prefix the log with
	 * @param {...string} text String(s) to log
	 * @returns {Promise<void>}
	 */
	public async warn(tag: string, ...text: string[]): Promise<void>
	{
		this._write(LogLevel.WARN, LogType.WARN, tag, text.join(' '));
	}

	/**
	 * Log error text to the logger transports. Will not be logged
	 * unless the logging level is `LogLevel.ERROR` or higher
	 * @param {string} tag Tag to prefix the log with
	 * @param {...string} text String(s) to log
	 * @returns {Promise<void>}
	 */
	public async error(tag: string, ...text: string[]): Promise<void>
	{
		this._write(LogLevel.ERROR, LogType.ERROR, tag, text.join(' '));
	}

	/**
	 * Log debug text to the logger transports. Will not be logged
	 * unless the logging level is `LogLevel.DEBUG`
	 * @param {string} tag Tag to prefix the log with
	 * @param {...string} text String(s) to log
	 * @returns {Promise<void>}
	 */
	public async debug(tag: string, ...text: string[]): Promise<void>
	{
		this._write(LogLevel.DEBUG, LogType.DEBUG, tag, text.join(' '));
	}

	/**
	 * Send log data to all transports
	 * @private
	 */
	private _write(level: LogLevel, type: LogType, tag: string, text: string): void
	{
		const timestamp: Date = new Date();
		for (const t of this._transports)
			if (level <= (<() => LogLevel> t.level)())
				t.transport({ timestamp, type, tag, text });
	}
}
