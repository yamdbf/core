/**
 * @typedef {string} ResolveArgType Valid arg type values for the ResolveArgs middleware
 * Can be one of the following string literals:
 * ```
 * 'String' | 'Number' | 'Duration' | 'User' | 'Member' | 'BannedUser' | 'Role' | 'Channel'
 * ```
 */

export type ResolveArgType = 'String' | 'Number' | 'Duration' | 'User' | 'Member' | 'BannedUser' | 'Channel' | 'Role';
