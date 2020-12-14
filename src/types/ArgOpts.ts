/**
 * @typedef {Object} ArgOpts Object containing options for
 * controlling how command arguments will be parsed
 * @property {string} [separator=' '] The charactor to separate args by
 */

export interface ArgOpts
{
	separator?: string | null;
}
