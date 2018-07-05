import { Script } from 'vm';

/**
 * A compiled localization template script, including an implicit
 * return coercion if it was syntactically possible to create one
 * @private
 */
export class CompiledTemplateScript
{
	public readonly raw: string;
	public readonly func!: Function;
	public readonly implicitReturnFunc: Function | undefined;

	public constructor(raw: string)
	{
		this.raw = raw;

		// Defer syntax error handling to the vm Script because
		// it will actually detail the code in question in the error
		try { this.func = new Function('args', 'res', raw); } catch {}

		// Because --noUnusedLocals, no-unused-expression, and I dislike
		// disabling tslint and TypeScript errors. Don't judge me.
		(this.func as any)._testScript = new Script(CompiledTemplateScript._functionWrap(raw));
		delete (this.func as any)._testScript;

		// Attempt to create the coerced implicit return function
		try
		{
			const functionBody: string = `return ${raw.replace(/^[\s]+/, '')}`;
			const implicitReturnFunc: Function = new Function('args', 'res', functionBody);
			this.implicitReturnFunc = implicitReturnFunc;
		}
		catch {}
	}

	/**
	 * Wrap the given code in a function body to prevent vm.Script
	 * throwing errors on top-level returns which are valid in the
	 * context of a template script
	 */
	private static _functionWrap(code: string)
	{
		return `function _(args, res) {\n${code}\n}`;
	}
}
