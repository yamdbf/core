/**
 * @typedef {object} LogData Represents an object passed from {@link Logger}
 * to any {@link TransportFunction}s given to it
 * @property {Date} timestamp Holds the time/date for this log
 * @property {string} type The log type. Will be one of:
 * 						   `LOG | INFO | WARN | ERROR | DEBUG`
 * @property {string} tag The tag given for this log
 * @property {string} text The text content of this log
 */

export type LogData = { timestamp: Date, type: string, tag: string, text: string };
