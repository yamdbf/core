/**
 * @typedef {enum} LogLevel Enum containing the different levels of
 * potential logger output. Each level represents itself and everything
 * above it in the enum. The default logger log level is `LogLevel.LOG`
 * ```
 * enum LogLevel
 * {
 * 	NONE,
 * 	LOG,
 * 	INFO,
 * 	WARN,
 * 	ERROR.
 * 	DEBUG
 * }
 * ```
 */
export declare enum LogLevel {
    NONE = 0,
    LOG = 1,
    INFO = 2,
    WARN = 3,
    ERROR = 4,
    DEBUG = 5
}
