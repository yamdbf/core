import { ResourceLoader } from '../../types/ResourceLoader';
import { Message } from '../../types/Message';
import { Command } from '../Command';
import { localizable } from '../CommandDecorators';
import { Lang } from '../../localization/Lang';
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
			return this.respond(message, res('CMD_RELOAD_ERR_UNKNOWN_COMMAND',
				{ commandName: commandName }));

		if (command) this.client.loadCommand(command.name);
		else this.client.loadCommand('all');

		const end: number = now();
		const name: string = command ? command.name : null;
		const text: string = name ? ` "${name}"` : 's';
		return this.respond(message, res('CMD_RELOAD_SUCCESS',
			{ commandName: name, time: (end - start).toFixed(3) }));
	}
}
