/**
 * @typedef {Function} MiddlewareFunction A function that takes a Message
 * object and an array of args, does anything with them, and returns a
 * {@link Tuple} where the first item is the Message object and the
 * second item is the array of args
 *
 * ```
 * (Message, any[]) => [Message, any[]]
 * ```
 *
 * Can be async as long as the returned promise resolves with the tuple
 * containing the message object and the args array as expected.
 *
 * If a middleware function returns a string, or throws a string/error,
 * it will be sent to the calling channel as a message and the Command
 * execution will be aborted. If a middleware function does not return
 * anything or returns something other than an array or string, the
 * Command will fail silently.
 *
 * >**Note:** The command dispatcher will attempt to bind the Command
 * instance to the middleware function when called, so `this` within a
 * middleware function (if it is not an arrow function) will be the
 * Command instance at runtime
 */

import { Message } from './Message';

export type MiddlewareFunction = (message: Message, args: any[]) => Promise<[Message, any[]]> | [Message, any[]];
