import { Bot } from '../../bot/Bot';
import { Message } from '../../types/Message';
import { Command } from '../Command';
import * as now from 'performance-now';

export default class Reload extends Command<Bot>
{
	public constructor(bot: Bot)
	{
		super(bot, {
			name: 'reload',
			description: 'Reload a command or all commands',
			usage: '<prefix>reload [command]',
			extraHelp: `If a command name or alias is provided the specific command will be reloaded. Otherwise, all commands will be reloaded.`,
			group: 'base',
			ownerOnly: true
		});
	}

	public action(message: Message, [commandName]: [string]): Promise<Message | Message[]>
	{
		const start: number = now();
		const command: Command<Bot> = this.bot.commands.findByNameOrAlias(commandName);

		if (commandName && !command)
			return this._respond(message, `Command "${commandName}" could not be found.`);

		if (command) this.bot.loadCommand(command.name);
		else this.bot.loadCommand('all');

		const end: number = now();
		const name: string = command ? command.name : null;
		const text: string = name ? ` "${name}"` : 's';
		return this._respond(message, `Command${text} reloaded. (${(end - start).toFixed(3)} ms)`);
	}
}
