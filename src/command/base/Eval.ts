import { Client } from '../../client/Client';
import { Message } from '../../types/Message';
import { Command } from '../Command';
import { localizable } from '../CommandDecorators';
import { ResourceLoader } from '../../types/ResourceLoader';
import { inspect } from 'util';
const Discord = require('discord.js'); // tslint:disable-line
const Yamdbf = require('../../index'); // tslint:disable-line

export default class extends Command
{
	public constructor()
	{
		super({
			name: 'eval',
			desc: 'Evaluate provided Javascript code',
			usage: '<prefix>eval <...code>',
			ownerOnly: true
		});
	}

	@localizable
	public action(message: Message, [res]: [ResourceLoader]): any
	{
		const client: Client = this.client;
		const code: string = message.content.split(this.name).slice(1).join(this.name).trim();
		if (!code) return this.respond(message, res('CMD_EVAL_ERR_NOCODE'));

		let evaled: string | Promise<string | object>;
		try { evaled = eval(code); }
		catch (err)
		{
			return this.respond(message, res('CMD_EVAL_ERROR', { code, error: this._clean(err) }));
		}

		if (evaled instanceof Promise)
		{
			evaled.then(result =>
			{
				if (typeof result !== 'string') result = inspect(result, { depth: 0 });
				this.respond(message, res('CMD_EVAL_RESULT', { code, result: this._clean(result) }));
			})
			.catch(err =>
			{
				this.respond(message, res('CMD_EVAL_ERROR', { code, error: this._clean(err) }));
			});
		}
		else
		{
			if (typeof evaled !== 'string')	evaled = inspect(evaled, { depth: 0 });
			return this.respond(message, res('CMD_EVAL_RESULT', { code, result: this._clean(evaled) }));
		}
	}

	private _clean(text: string): string
	{
		return typeof text === 'string' ? text
			.replace(/`/g, `\`${String.fromCharCode(8203)}`)
			.replace(/@/g, `@${String.fromCharCode(8203)}`)
			.replace(/[\w\d]{24}\.[\w\d]{6}\.[\w\d-_]{27}/g, '[REDACTED]')
			.replace(/email: '[^']+'/g, `email: '[REDACTED]'`)
			: text;
	}
}
