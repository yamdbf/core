import { LogLevel } from '../../types/LogLevel';
export { logger } from './LoggerDecorator';
import * as chalk from 'chalk';

/**
 * Singleton containing methods for asynchronous logging with clean,
 * configurable output
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
	private constructor()
	{
		if (Logger._instance)
			throw new Error('Cannot create multiple instances of Logger singleton');
		Logger._instance = this;
		this._logLevel = 1;
	}

	/**
	 * `LogLevel.NONE` enum shortcut
	 * @name Logger.NONE
	 * @type {LogLevel}
	 */
	public static readonly NONE: LogLevel = LogLevel.NONE;

	/**
	 * `LogLevel.LOG` enum shortcut
	 * @name Logger.LOG
	 * @type {LogLevel}
	 */
	public static readonly LOG: LogLevel = LogLevel.LOG;

	/**
	 * `LogLevel.INFO` enum shortcut
	 * @name Logger.INFO
	 * @type LogLevel
	 */
	public static readonly INFO: LogLevel = LogLevel.INFO;

	/**
	 * `LogLevel.WARN` enum shortcut
	 * @name Logger.WARN
	 * @type {LogLevel}
	 */
	public static readonly WARN: LogLevel = LogLevel.WARN;

	/**
	 * `LogLevel.ERROR` enum shortcut
	 * @name Logger.ERROR
	 * @type {LogLevel}
	 */
	public static readonly ERROR: LogLevel = LogLevel.ERROR;

	/**
	 * `LogLevel.DEBUG` enum shortcut
	 * @name Logger.DEBUG
	 * @type LogLevel
	 */
	public static readonly DEBUG: LogLevel = LogLevel.DEBUG;

	/**
	 * Returns the Logger singleton instance
	 * @method Logger.instance
	 * @returns {Logger}
	 */
	public static instance(): Logger
	{
		if (!Logger._instance) return new Logger();
		else return Logger._instance;
	}

	/**
	 * Set the level of output that will be logged
	 * @method Logger#setLogLevel
	 * @param {LogLevel} level The level of logging to output
	 */
	public setLogLevel(level: LogLevel): void
	{
		this._logLevel = level;
	}

	/**
	 * Log to the console. This is the base level of logging and is the default
	 * log level, represented by `LogLevel.LOG`, when the logger singleton is created
	 * @method Logger#log
	 * @param {string} tag Tag to prefix the log with
	 * @param {...string} text String(s) to log
	 */
	public async log(tag: string, ...text: string[]): Promise<void>
	{
		if (this._logLevel < LogLevel.LOG) return;
		this._write(chalk.green('LOG'), tag, text.join(' '));
	}

	/**
	 * Log information that doesn't need to be visible by default to the console.
	 * Will not be logged unless the logging level is `LogLevel.INFO` or higher
	 * @method Logger#info
	 * @param {string} tag Tag to prefix the log with
	 * @param {...string} text String(s) to log
	 */
	public async info(tag: string, ...text: string[]): Promise<void>
	{
		if (this._logLevel < LogLevel.INFO) return;
		this._write(chalk.blue('INFO'), tag, text.join(' '));
	}

	/**
	 * Log warning text to the console.
	 * Will not be logged unless the logging level is `LogLevel.WARN` or higher
	 * @method Logger#warn
	 * @param {string} tag Tag to prefix the log with
	 * @param {...string} text String(s) to log
	 */
	public async warn(tag: string, ...text: string[]): Promise<void>
	{
		if (this._logLevel < LogLevel.WARN) return;
		this._write(chalk.yellow('WARN'), tag, text.join(' '));
	}

	/**
	 * Log error text to the console.
	 * Will not be logged unless the logging level is `LogLevel.ERROR` or higher
	 * @method Logger#error
	 * @param {string} tag Tag to prefix the log with
	 * @param {...string} text String(s) to log
	 */
	public async error(tag: string, ...text: string[]): Promise<void>
	{
		if (this._logLevel < LogLevel.ERROR) return;
		this._write(chalk.red('ERROR'), tag, text.join(' '));
	}

	/**
	 * Log debug text to the console.
	 * Will not be logged unless the logging level is `LogLevel.DEBUG`
	 * @method Logger#debug
	 * @param {string} tag Tag to prefix the log with
	 * @param {...string} text String(s) to log
	 */
	public async debug(tag: string, ...text: string[]): Promise<void>
	{
		if (this._logLevel < LogLevel.DEBUG) return;
		this._write(chalk.magenta('DEBUG'), tag, text.join(' '));
	}

	/**
	 * Write to the console
	 * @private
	 */
	private _write(type: string, tag: string, text: string): void
	{
		const d: Date = new Date();
		const hours: number = d.getHours();
		const minutes: number = d.getMinutes();
		const seconds: number = d.getSeconds();
		const timestamp: string = `${
			hours < 10 ? `0${hours}` : hours}:${
			minutes < 10 ? `0${minutes}` : minutes}:${
			seconds < 10 ? `0${seconds}` : seconds}`;

		process.stdout.write(`[${chalk.grey(timestamp)}][${type}][${chalk.cyan(tag)}]: ${text}\n`);
	}
}
