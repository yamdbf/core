import { Collection } from 'discord.js';
import { ResourceLoader } from '../../types/ResourceLoader';
import { BaseStrings as s } from '../../localization/BaseStrings';
import { Message } from '../../types/Message';
import { Command } from '../Command';
import { localizable } from '../CommandDecorators';
import { Util } from '../../util/Util';
import { Logger, logger } from '../../util/logger/Logger';
const { now } = Util;

export default class extends Command
{
	@logger('Command:reload')
	private readonly _logger: Logger;

	public constructor()
	{
		super({
			name: 'reload',
			desc: 'Reload all custom commands',
			usage: '<prefix>reload',
			ownerOnly: true
		});
	}

	@localizable
	public action(message: Message, [res]: [ResourceLoader]): Promise<Message | Message[]>
	{
		this._logger.log(`Reloading commands from: $${this.client.commandsDir}`);

		const start: number = now();

		const disabled: string[] = this.client.commands.filter(c => c.disabled).map(c => c.name);
		const reloaded: number = this.client._reloadCustomCommands() + 1;

		this._logger.log(`Re-initializing reloaded commands...`);
		this.client.commands._initCommands();

		const toDisable: Collection<string, Command> =
			this.client.commands.filter(c => disabled.includes(c.name));

		// Re-disable previously disabled commands
		for (const command of toDisable.values()) command.disable();

		const end: number = now();
		return this.respond(message, res(s.CMD_RELOAD_SUCCESS,
			{ number: reloaded.toString(), time: (end - start).toFixed(3) }));
	}
}
