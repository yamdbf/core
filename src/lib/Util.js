'use babel';
'use strict';

/** @module Util */

/**
 * Pads the right side of a string with spaces to the given length
 * @static
 * @param {string} text - Text to pad
 * @param {number} length - Length to pad to
 * @returns {string}
 */
export function padRight(text, length)
{
	let pad = Math.max(0, Math.min(length, length - text.length));
	return `${text}${' '.repeat(pad)}`;
}
