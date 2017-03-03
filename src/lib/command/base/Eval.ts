import { Bot } from '../../bot/Bot';
import { Message } from '../../types/Message';
import { Command } from '../Command';
import { inspect } from 'util';
import * as Discord from 'discord.js'; // tslint:disable-line
import * as Yamdbf from '../../../index'; // tslint:disable-line

export default class Eval extends Command<Bot>
{
	public constructor(bot: Bot)
	{
		super(bot, {
			name: 'eval',
			description: 'Evaluate provided Javascript code',
			usage: '<prefix>eval <code>',
			group: 'base',
			ownerOnly: true
		});
	}

	public action(message: Message): void
	{
		const code: string = message.content.split(this.name).slice(1).join(this.name).trim();
		if (!code)
		{
			this._respond(message, '**ERROR:** ```xl\nNo code provided to evaluate.\n```');
			return;
		}

		let evaled: string | Promise<string | object> = eval(code);
		if (evaled instanceof Promise)
		{
			evaled.then(res =>
			{
				if (typeof res !== 'string') res = inspect(res, { depth: 0 });
				this._respond(message,
					`**INPUT:**\n\`\`\`js\n${code}\n\`\`\`\n**OUTPUT:**\n\`\`\`xl\n${this._clean(res)}\n\`\`\``);
			})
			.catch(err =>
			{
				this._respond(message,
					`**INPUT:**\n\`\`\`js\n${code}\n\`\`\`\n**ERROR:**\n\`\`\`xl\n${this._clean(err)}\n\`\`\``);
			});
		}
		else
		{
			if (typeof evaled !== 'string')	evaled = inspect(evaled, { depth: 0 });
			this._respond(message,
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
