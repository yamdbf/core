/**
 * Logs a deprecation warning for the decorated class method
 * whenever it is called
 * @param {string} [message] Method deprecation message
 * @returns {MethodDecorator}
 */
export declare function deprecated<T extends Function>(message?: string): MethodDecorator;
