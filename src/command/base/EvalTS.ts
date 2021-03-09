/* eslint-disable max-classes-per-file */
import * as fs from 'fs';
import { Client } from '../../client/Client';
import { Command } from '../Command';
import { Message } from '../../types/Message';
import { Middleware } from '../middleware/Middleware';
import { ResourceProxy } from '../../types/ResourceProxy';
import { Util } from '../../util/Util';
import { inspect } from 'util';
import { using } from '../CommandDecorators';

// @ts-ignore - Exposed for eval command invocations
// eslint-disable-next-line @typescript-eslint/typedef, @typescript-eslint/no-unused-vars
const Discord = require('discord.js');

// @ts-ignore - Exposed for eval command invocations
// eslint-disable-next-line @typescript-eslint/typedef, @typescript-eslint/no-unused-vars
const Yamdbf = require('../../index');

let ts: any;
try { ts = require('typescript'); }
catch {}

class CompilerError extends Error
{
	public name: string = 'CompilerError';
	public constructor(message: string)
	{
		super(message);
	}
}

export default class extends Command
{
	public constructor()
	{
		super({
			name: 'eval:ts',
			desc: 'Evaluate provided Typescript code',
			usage: '<prefix>eval:ts <...code>',
			info: [
				'Runs pretty slowly due to having to run diagnostics before compiling.',
				'If Typescript is not installed the provided code will be evaluated as',
				'Javascript and diagnostics/compilation will be skipped.'
			].join(' '),
			ownerOnly: true
		});
	}

	@using(Middleware.localize)
	public async action(message: Message, [res]: [ResourceProxy]): Promise<any>
	{
		// Error out if TS is not installed
		if (typeof ts === 'undefined')
			return this.respond(message, res.CMD_EVAL_ERR_MISSING_TS());

		// @ts-ignore - Exposed for eval command invocations
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const client: Client = this.client;
		const [, , prefix, name] = await Util.wasCommandCalled(message);
		const call: RegExp = new RegExp(`^${Util.escape(prefix)} *${name}`);
		const code: string = message.content.replace(call, '').trim();

		if (!code) return this.respond(message, res.CMD_EVAL_ERR_NOCODE());

		const start: Message = await this.respond(message, '*Compiling...*') as Message;
		let evaled: string | Promise<string | object>;
		try
		{
			const compiled: string = this._compile(code);
			// eslint-disable-next-line no-eval
			evaled = await eval(compiled);
		}
		catch (err)
		{
			return start.edit(res.CMD_EVAL_ERROR({ code, error: this._clean(err) }));
		}

		if (typeof evaled !== 'string') evaled = inspect(evaled, { depth: 0 });
		return start.edit(res.CMD_EVAL_RESULT({ code, result: this._clean(evaled) }));
	}

	private _compile(code: string): string
	{
		let message!: string;

		const fileName: string = `${__dirname}/eval${Date.now()}.ts`;
		fs.writeFileSync(fileName, code);

		const program: any = ts.createProgram([fileName], { module: ts.ModuleKind.CommonJS });
		const diagnostics: any[] = ts.getPreEmitDiagnostics(program);

		if (diagnostics.length > 0)
		{
			const mappedDiagnostics: string[] = diagnostics
				.map(d =>
				{
					const messageText: string = ts.flattenDiagnosticMessageText(d.messageText, '\n');
					const { line, character } = d.file.getLineAndCharacterOfPosition(d.start);
					return `\n(${line as number + 1},${character as number + 1}): ${messageText} (${d.code})`;
				})
				.filter(d => !d.includes('Cannot find name'));

			if (mappedDiagnostics.length > 0)
				message = mappedDiagnostics.join('');
		}

		fs.unlinkSync(fileName);

		if (message)
			throw new CompilerError(message);

		return ts
			? ts.transpileModule(code, { compilerOptions: { module: ts.ModuleKind.CommonJS } })
				.outputText
				.replace('"use strict";\r\nexports.__esModule = true;\r\n', '')
			: code;
	}

	private _clean(text: string): string
	{
		return typeof text === 'string' ? text
			.replace(/`/g, `\`${String.fromCharCode(8203)}`)
			.replace(/@/g, `@${String.fromCharCode(8203)}`)
			.replace(/[\w\d]{24}\.[\w\d]{6}\.[\w\d-_]{27}/g, '[REDACTED]')
			.replace(/email: '[^']+'/g, 'email: \'[REDACTED]\'')
			: text;
	}
}
