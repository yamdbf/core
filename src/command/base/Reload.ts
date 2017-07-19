import { Collection } from 'discord.js';
import { ResourceLoader } from '../../types/ResourceLoader';
import { Message } from '../../types/Message';
import { Command } from '../Command';
import { localizable } from '../CommandDecorators';
import now = require('performance-now');

export default class extends Command
{
	public constructor()
	{
		super({
			name: 'reload',
			desc: 'Reload a command or all commands',
			usage: '<prefix>reload [command]',
			info: `If a command name or alias is provided the specific command will be reloaded. Otherwise, all commands will be reloaded.`,
			ownerOnly: true
		});
	}

	@localizable
	public action(message: Message, [res, commandName]: [ResourceLoader, string]): Promise<Message | Message[]>
	{
		const start: number = now();
		const command: Command = this.client.commands.findByNameOrAlias(commandName);

		if (commandName && !command)
			return this.respond(message, res('CMD_RELOAD_ERR_UNKNOWN_COMMAND', { commandName }));

		const disabled: string[] = this.client.commands.filter(c => c.disabled).map(c => c.name);

		if (command) this.client.loadCommand(command.name);
		else this.client.loadCommand('all');

		let filteredCommands: Collection<string, Command> =
			this.client.commands.filter(c => disabled.includes(c.name));

		for (const cmd of filteredCommands.values()) cmd.disable();

		const end: number = now();
		const name: string = command ? command.name : null;
		return this.respond(message, res('CMD_RELOAD_SUCCESS',
			{ commandName: name, time: (end - start).toFixed(3) }));
	}
}
