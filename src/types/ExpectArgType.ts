/**
 * @typedef {string} ExpectArgType Valid arg type values for the Expect middleware
 * Can be one of the following types as strings:
 * ```
 * 'String' | 'Number' | 'User' | 'Member' | 'Role' | 'Channel' | 'Any'
 * ```
 * or an Array of possible string literal values if specific string options are desired
 */

export type ExpectArgType = 'String' | 'Number' | 'User' | 'Member' | 'Channel' | 'Role' | 'Any' | string[];
