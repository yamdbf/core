/**
 * @typedef {Function} TransportFunction Represents a function to be given
 * to {@link Logger#addTransport} that will receive log data. What is done
 * with that log data is up to you, but logging to a file or a database
 * would be some examples
 * @param {LogData} data The data received from the logger
 */

import { LogData } from './LogData';
export type TransportFunction = (data: LogData) => void;
