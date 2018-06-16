import { LangStringNode } from './LangStringNode';

/**
 * Holds the localization strings for a given language
 * @private
 */
export class Language
{
	public name: string;
	public strings: { [key: string]: LangStringNode };

	public constructor(name: string)
	{
		this.name = name;
		this.strings = {};
	}

	/**
	 * Concatenate another Language object's strings of the
	 * same language with this Language object's strings,
	 * adding them to this Language object's `strings` object
	 */
	public concat(lang: Language): void
	{
		if (lang.name !== this.name)
			throw new Error('Cannot concatenate strings for different languages.');

		this.strings = { ...this.strings, ...lang.strings };
	}
}
