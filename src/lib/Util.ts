/**
 * Utility class containing handy static methods that can
 * be used anywhere
 * @class Util
 */
export class Util
{
	/**
	 * Pads the right side of a string with spaces to the given length
	 * @static
	 * @param {string} text - Text to pad
	 * @param {number} length - Length to pad to
	 * @returns {string}
	 */
	public static padRight(text: string, length: number): string
	{
		let pad: number = Math.max(0, Math.min(length, length - text.length));
		return `${text}${' '.repeat(pad)}`;
	}

	/**
	 * Returns the given string lowercased with any non
	 * alphanumeric chars removed
	 * @static
	 * @param {string} text - Text to normalize
	 * @returns {string}
	 */
	public static normalize(text: string): string
	{
		return text.toLowerCase().replace(/[^a-z0-9]+/g, '');
	}
}
