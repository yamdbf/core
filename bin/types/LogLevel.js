"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["NONE"] = 0] = "NONE";
    LogLevel[LogLevel["LOG"] = 1] = "LOG";
    LogLevel[LogLevel["INFO"] = 2] = "INFO";
    LogLevel[LogLevel["WARN"] = 3] = "WARN";
    LogLevel[LogLevel["ERROR"] = 4] = "ERROR";
    LogLevel[LogLevel["DEBUG"] = 5] = "DEBUG";
})(LogLevel = exports.LogLevel || (exports.LogLevel = {}));

//# sourceMappingURL=LogLevel.js.map
