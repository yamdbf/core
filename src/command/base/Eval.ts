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
		if (!code)
		{
			this.respond(message, `**ERROR:** \`\`\`xl\n${res('CMD_EVAL_ERR_NOCODE')}\n\`\`\``);
			return;
		}

		let evaled: string | Promise<string | object>;
		try
		{
			evaled = eval(code);
		}
		catch (err)
		{
			return this.respond(message,
				`**INPUT:**\n\`\`\`js\n${code}\n\`\`\`\n**ERROR:**\n\`\`\`xl\n${this._clean(err)}\n\`\`\``);
		}
		if (evaled instanceof Promise)
		{
			evaled.then(result =>
			{
				if (typeof result !== 'string') result = inspect(result, { depth: 0 });
				this.respond(message,
					`**INPUT:**\n\`\`\`js\n${code}\n\`\`\`\n**OUTPUT:**\n\`\`\`xl\n${this._clean(result)}\n\`\`\``);
			})
			.catch(err =>
			{
				this.respond(message,
					`**INPUT:**\n\`\`\`js\n${code}\n\`\`\`\n**ERROR:**\n\`\`\`xl\n${this._clean(err)}\n\`\`\``);
			});
		}
		else
		{
			if (typeof evaled !== 'string')	evaled = inspect(evaled, { depth: 0 });
			return this.respond(message,
				`**INPUT:**\n\`\`\`js\n${code}\n\`\`\`\n**OUTPUT:**\n\`\`\`xl\n${this._clean(evaled)}\n\`\`\``);
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
