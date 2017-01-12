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

/**
 * Returns the given string lowercased with any non
 * alphanumeric chars removed
 * @static
 * @param {string} text - Text to normalize
 * @returns {string}
 */
export function normalize(text)
{
	return text.toLowerCase().replace(/[^a-z0-9]+/g, '');
}
