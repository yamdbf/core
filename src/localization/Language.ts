/**
 * Holds the localization strings for a given language
 * @private
 */
export class Language
{
	public lang: string;
	public strings: { [key: string]: string };
	public raw: { [key: string]: string };
	public constructor(lang: string)
	{
		this.lang = lang;
		this.strings = {};
		this.raw = {};
	}

	/**
	 * Concatenate another Language object's strings of the
	 * same language with this Language object's strings,
	 * saving them to this Language object's `strings` value
	 */
	public concat(lang: Language): void
	{
		if (lang.lang !== this.lang)
			throw new Error('Cannot concatenate strings for different languages.');
		this.strings = { ...this.strings, ...lang.strings };
		this.raw = { ...this.raw, ...lang.raw };
	}
}
