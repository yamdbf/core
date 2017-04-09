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
export enum LogLevel
{
	NONE,
	LOG,
	INFO,
	WARN,
	ERROR,
	DEBUG
}
