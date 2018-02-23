/**
 * @typedef {string} BaseResolverType Valid argument resolver types
 * for use with [resolve]{@link module:Middleware.resolve} and
 * [expect]{@link module:Middleware.expect}. Can be one of
 * the following string literals:
 * ```
 * 'String' | 'Number' | 'Duration' | 'User' | 'Member' | 'BannedUser' | 'Channel' | 'Role' | 'Any'
 * ```
 * or an Array of possible string literal values
 */
export declare type BaseResolverType = 'String' | 'Number' | 'Duration' | 'User' | 'Member' | 'BannedUser' | 'Channel' | 'Role' | 'Any';
