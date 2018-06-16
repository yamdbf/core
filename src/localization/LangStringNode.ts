import { CompiledTemplateScript } from './CompiledTemplateScript';

/**
 * Represents a localization string parsed and compiled from a .lang file
 * @private
 */
export class LangStringNode
{
	public readonly key: string;
	public readonly value: string;
	public readonly raw: string;
	public readonly scripts: CompiledTemplateScript[];

	public constructor(key: string, value: string, raw: string, scripts: CompiledTemplateScript[])
	{
		this.key = key;
		this.value = value;
		this.raw = raw;
		this.scripts = scripts;
	}
}
