/**
 * @typedef {Function} MiddlewareFunction A function that takes a Message object and an array of args,
 * does anything with them, and returns an array where the first item is the Message object and the
 * second item is the array of args.
 *
 * It should be noted that the command dispatcher will attempt to bind the called Command instance
 * to the middleware function, so if it is not an arrow function `this` within a middleware
 * function will be the Command instance at runtime
 */

import { Message } from './Message';

export type MiddlewareFunction = (message: Message, args: any[]) => Promise<[Message, any[]]> | [Message, any[]];
