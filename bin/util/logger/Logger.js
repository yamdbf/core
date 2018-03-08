"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const LogLevel_1 = require("../../types/LogLevel");
const LogType_1 = require("./LogType");
var LoggerDecorator_1 = require("./LoggerDecorator");
exports.logger = LoggerDecorator_1.logger;
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
class Logger {
    constructor() {
        if (Logger._instance)
            throw new Error('Cannot create multiple instances of Logger singleton. Use Logger.instance() instead');
        Logger._instance = this;
        this._logLevel = LogLevel_1.LogLevel.DEBUG;
        this._transports = [];
        this._baseTransportRemoved = false;
        const colors = {
            red: [31, 39],
            green: [32, 39],
            yellow: [33, 39],
            blue: [34, 39],
            magenta: [35, 39],
            cyan: [36, 39],
            grey: [90, 39]
        };
        const wrapColor = (c, ...text) => `\u001B[${c[0]}m${text.join(' ')}\u001B[${c[1]}m`;
        const createWrapper = color => (...text) => wrapColor(color, ...text);
        const typeColorWrappers = {
            [LogType_1.LogType.LOG]: createWrapper(colors.green),
            [LogType_1.LogType.INFO]: createWrapper(colors.blue),
            [LogType_1.LogType.WARN]: createWrapper(colors.yellow),
            [LogType_1.LogType.ERROR]: createWrapper(colors.red),
            [LogType_1.LogType.DEBUG]: createWrapper(colors.magenta)
        };
        const zeroPad = n => `0${n}`.slice(-2);
        const shard = () => {
            const isSharded = typeof Logger._shard !== 'undefined';
            const shardNum = (Logger._shard || 0) < 10 ? zeroPad(Logger._shard || 0) : Logger._shard.toString();
            const shardTag = `[${wrapColor(colors.cyan, `SHARD_${shardNum}`)}]`;
            return isSharded ? shardTag : '';
        };
        const transport = data => {
            let { type, tag, text } = data;
            const d = data.timestamp;
            const h = zeroPad(d.getHours());
            const m = zeroPad(d.getMinutes());
            const s = zeroPad(d.getSeconds());
            const t = wrapColor(colors.grey, `${h}:${m}:${s}`);
            type = typeColorWrappers[type](type);
            tag = wrapColor(colors.cyan, tag);
            process.stdout.write(`[${t}]${shard()}[${type}][${tag}]: ${text}\n`);
        };
        this.addTransport({ transport });
    }
    /**
     * Returns the Logger singleton instance
     *
     * When given a tag parameter, a Logger proxy will be returned
     * that automatically applies the given tag to all logging methods
     * in lieu of them requiring a tag parameter before the log content
     * @param {string} [tag] Tag for this instance proxy
     * @returns {Logger}
     */
    static instance(tag) {
        if (tag)
            return Logger.taggedInstance(tag);
        else
            return Logger._instance || new Logger();
    }
    /**
     * Returns an instance proxy that prefixes logging
     * method calls with the given tag
     * @private
     */
    static taggedInstance(tag) {
        return new Proxy(Logger.instance(), {
            get: (target, key) => {
                switch (key) {
                    case 'log':
                    case 'info':
                    case 'warn':
                    case 'error':
                    case 'debug':
                        return (...text) => target[key](tag, ...text);
                    default: return target[key];
                }
            }
        });
    }
    /**
     * Set the level of output that will be logged
     * @param {LogLevel} level The level of logging to output
     * @returns {void}
     */
    setLogLevel(level) {
        this._logLevel = level;
    }
    /**
     * Add a {@link Transport} for the Logger to use for logging.
     * The logger will log to all provided transports
     * @param {Transport} transport The transport to add
     * @returns {void}
     */
    addTransport(transport) {
        const level = transport.level;
        transport.level = typeof level === 'undefined'
            ? () => this._logLevel
            : typeof level === 'function'
                ? level
                : () => level;
        this._transports.push(transport);
    }
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
    removeBaseTransport() {
        if (this._baseTransportRemoved)
            return;
        this._baseTransportRemoved = true;
        this._transports.shift();
    }
    /**
     * Log useful information to the Logger transports. Will not be logged
     * unless the log level is `LogLevel.LOG` or higher
     * @param {string} tag Tag to prefix the log with
     * @param {...string} text String(s) to log
     * @returns {Promise<void>}
     */
    async log(tag, ...text) {
        this._write(LogLevel_1.LogLevel.LOG, LogType_1.LogType.LOG, tag, text.join(' '));
    }
    /**
     * Log less important information to the logger transports. Will not
     * be logged unless the logging level is `LogLevel.INFO` or higher
     * @param {string} tag Tag to prefix the log with to identify the
     * 					   source of the log
     * @param {...string} text String(s) to log
     * @returns {Promise<void>}
     */
    async info(tag, ...text) {
        this._write(LogLevel_1.LogLevel.INFO, LogType_1.LogType.INFO, tag, text.join(' '));
    }
    /**
     * Log warning text to the logger transports. Will not be logged
     * unless the logging level is `LogLevel.WARN` or higher
     * @param {string} tag Tag to prefix the log with
     * @param {...string} text String(s) to log
     * @returns {Promise<void>}
     */
    async warn(tag, ...text) {
        this._write(LogLevel_1.LogLevel.WARN, LogType_1.LogType.WARN, tag, text.join(' '));
    }
    /**
     * Log error text to the logger transports. Will not be logged
     * unless the logging level is `LogLevel.ERROR` or higher
     * @param {string} tag Tag to prefix the log with
     * @param {...string} text String(s) to log
     * @returns {Promise<void>}
     */
    async error(tag, ...text) {
        this._write(LogLevel_1.LogLevel.ERROR, LogType_1.LogType.ERROR, tag, text.join(' '));
    }
    /**
     * Log debug text to the logger transports. Will not be logged
     * unless the logging level is `LogLevel.DEBUG`
     * @param {string} tag Tag to prefix the log with
     * @param {...string} text String(s) to log
     * @returns {Promise<void>}
     */
    async debug(tag, ...text) {
        this._write(LogLevel_1.LogLevel.DEBUG, LogType_1.LogType.DEBUG, tag, text.join(' '));
    }
    /**
     * Send log data to all transports
     * @private
     */
    _write(level, type, tag, text) {
        const timestamp = new Date();
        for (const t of this._transports)
            if (level <= t.level())
                t.transport({ timestamp, type, tag, text });
    }
}
/**
 * `LogLevel.NONE` enum shortcut
 * @type {LogLevel}
 */
Logger.NONE = LogLevel_1.LogLevel.NONE;
/**
 * `LogLevel.LOG` enum shortcut
 * @type {LogLevel}
 */
Logger.LOG = LogLevel_1.LogLevel.LOG;
/**
 * `LogLevel.INFO` enum shortcut
 * @type LogLevel
 */
Logger.INFO = LogLevel_1.LogLevel.INFO;
/**
 * `LogLevel.WARN` enum shortcut
 * @type {LogLevel}
 */
Logger.WARN = LogLevel_1.LogLevel.WARN;
/**
 * `LogLevel.ERROR` enum shortcut
 * @type {LogLevel}
 */
Logger.ERROR = LogLevel_1.LogLevel.ERROR;
/**
 * `LogLevel.DEBUG` enum shortcut
 * @type LogLevel
 */
Logger.DEBUG = LogLevel_1.LogLevel.DEBUG;
exports.Logger = Logger;

//# sourceMappingURL=Logger.js.map
