import { Collection } from 'discord.js';
import { Message } from '../../types/Message';
import { Command } from '../Command';
import { using } from '../CommandDecorators';
import { Middleware } from '../middleware/Middleware';
import { ResourceProxy } from '../../types/ResourceProxy';
import { Util } from '../../util/Util';
import { Logger, logger } from '../../util/logger/Logger';

export default class extends Command
{
	@logger('Command:reload')
	private readonly _logger!: Logger;

	public constructor()
	{
		super({
			name: 'reload',
			desc: 'Reload all custom commands',
			usage: '<prefix>reload',
			ownerOnly: true
		});
	}

	@using(Middleware.localize)
	public action(message: Message, [res]: [ResourceProxy]): Promise<Message | Message[]>
	{
		this._logger.log(`Reloading commands from: $${this.client.commandsDir}`);

		const start: number = Util.now();

		const disabled: string[] = this.client.commands.filter(c => c.disabled).map(c => c.name);
		const reloaded: number = this.client._reloadCustomCommands();

		this._logger.log(`Re-initializing reloaded commands...`);
		this.client.commands._initCommands();

		const toDisable: Collection<string, Command> =
			this.client.commands.filter(c => disabled.includes(c.name));

		// Re-disable previously disabled commands
		for (const command of toDisable.values()) command.disable();

		const end: number = Util.now();
		const num: string = reloaded.toString();
		const time: string = (end - start).toFixed(3);
		return this.respond(message, res.CMD_RELOAD_SUCCESS({ number: num, time }));
	}
}
