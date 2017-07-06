/**
 * @typedef {string|string[]} ExpectArgType Valid arg type values
 * for [expect]{@link module:Middleware.expect}. Can be one of
 * the following string literals:
 * ```
 * 'String' | 'Number' | 'User' | 'Member' | 'Role' | 'Channel' | 'Any'
 * ```
 * or an Array of possible string literal values if specific string options are desired
 */

export type ExpectArgType = 'String' | 'Number' | 'User' | 'Member' | 'Channel' | 'Role' | 'Any' | string[];
