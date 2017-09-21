import { Language } from './Language';

/**
 * Class for parsing `.lang` files
 * @private
 */
export class LangFileParser
{
	private static _parseBlock: RegExp = /(\[(\w+)\]\n([\s\S]*?))(?=\n\n+?(?:## *.*\n)*\[\w+\]\n.+|\n*?$)/;
	private static _parseBlocks: RegExp = new RegExp(LangFileParser._parseBlock, 'g');
	private static _stripComments: RegExp = /^(?!$)\s*##.*\n|##.*$/gm;
	private static _trimNewlines: RegExp = /^\n|\n$/g;

	/**
	 * Parse a given language file string and return a Language
	 * object containing all the parsed values
	 */
	public static parseFile(langName: string, fileContents: string): Language
	{
		const lang: Language = new Language(langName);
		const blocks: string[] = fileContents.match(LangFileParser._parseBlocks);
		for (const block of blocks)
		{
			const match: RegExpMatchArray = block.match(LangFileParser._parseBlock);
			const raw: string = match[1];
			const key: string = match[2];
			const value: string = match[3]
				.replace(LangFileParser._stripComments, '')
				.replace(LangFileParser._trimNewlines, '')
				.trim();

			lang.strings[key] = value;
			lang.raw[key] = raw;
		}
		return lang;
	}
}
