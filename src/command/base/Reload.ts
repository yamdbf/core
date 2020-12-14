import { Logger, logger } from '../../util/logger/Logger';
import { Collection } from 'discord.js';
import { Command } from '../Command';
import { Message } from '../../types/Message';
import { Middleware } from '../middleware/Middleware';
import { ResourceProxy } from '../../types/ResourceProxy';
import { Util } from '../../util/Util';
import { using } from '../CommandDecorators';

export default class extends Command
{
	@logger('Command:reload')
	private readonly _logger!: Logger;

	public constructor()
	{
		super({
			name: 'reload',
			desc: 'Reload all custom commands and all events',
			usage: '<prefix>reload',
			ownerOnly: true
		});
	}

	@using(Middleware.localize)
	public async action(message: Message, [res]: [ResourceProxy]): Promise<Message | Message[]>
	{
		this._logger.log(`Reloading commands from: $${this.client.commandsDir}`);

		const commandStart: number = Util.now();

		const disabled: string[] = this.client.commands.filter(c => c.disabled).map(c => c.name);
		const reloaded: number = this.client._reloadCustomCommands();

		this._logger.log('Re-initializing reloaded commands...');
		this.client.commands._initCommands();

		const toDisable: Collection<string, Command> =
			this.client.commands.filter(c => disabled.includes(c.name));

		// Re-disable previously disabled commands
		for (const command of toDisable.values())
			command.disable();

		const commandEnd: number = Util.now();
		const commandNumber: string = reloaded.toString();

		// Reload events
		const eventStart: number = Util.now();
		const eventNumber: string = this.client._reloadEvents().toString();
		const eventEnd: number = Util.now();

		const commandTime: string = (commandEnd - commandStart).toFixed(3);
		const eventTime: string = (eventEnd - eventStart).toFixed(3);
		return this.respond(message, res.CMD_RELOAD_SUCCESS({ commandNumber, commandTime, eventNumber, eventTime }));
	}
}
