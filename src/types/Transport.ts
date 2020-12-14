/**
 * @typedef {object} Transport Represents a transport object for the {@link Logger}.
 * @property {TransportFunction} transport The transport function to use for this transport
 * @property {LogLevel} [level] The log level for this transport. Will default dynamically
 * 								to the Logger's log level if none is provided
 */

import { LogLevel } from './LogLevel';
import { TransportFunction } from './TransportFunction';

export interface Transport
{
	transport: TransportFunction;
	level?: LogLevel | (() => LogLevel);
}
