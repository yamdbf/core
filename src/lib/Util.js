'use babel';
'use strict';

/** @module Util */

/**
 * Pads the right side of a string with spaces to the given length
 * @static
 * @param {string} text - Text to pad
 * @param {number} len - Length to pad to
 * @returns {string}
 */
export function padRight(text, len)
{
	return text + ' '.repeat(len - text.length);
}
