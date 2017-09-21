/**
 * Holds the localization strings for a given language
 * @private
 */
export class Language
{
	public name: string;
	public strings: { [key: string]: string };
	public raw: { [key: string]: string };

	public constructor(name: string)
	{
		this.name = name;
		this.strings = {};
		this.raw = {};
	}

	/**
	 * Concatenate another Language object's strings of the
	 * same language with this Language object's strings,
	 * saving them to this Language object's `strings` value
	 */
	public concat(name: Language): void
	{
		if (name.name !== this.name)
			throw new Error('Cannot concatenate strings for different languages.');

		this.strings = { ...this.strings, ...name.strings };
		this.raw = { ...this.raw, ...name.raw };
	}
}
