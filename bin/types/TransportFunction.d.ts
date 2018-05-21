/**
 * @typedef {Function} TransportFunction Represents a function to be included
 * in a {@link Transport} object. This function will be given a {@link LogData}
 * object at runtime whenever a logger method is called. What is done with that
 * log data is entirely up to you as the developer, but logging to a file.
 * to a database, or even to a Discord channel would be some good examples
 * @param {LogData} data The data received from the logger
 */
import { LogData } from './LogData';
export declare type TransportFunction = (data: LogData) => void;
