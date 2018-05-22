import { Resolver } from '../Resolver';
import { Client } from '../../../client/Client';
import { Command } from '../../Command';
import { Message } from '../../../types/Message';
import { Lang } from '../../../localization/Lang';
import { ResourceProxy } from '../../../types/ResourceProxy';

export class CommandResolver extends Resolver
{
	public constructor(client: Client)
	{
		super(client, 'Command');
	}

	public validate(value: any): boolean
	{
		return value instanceof Command;
	}

	public resolveRaw(value: string): Command | undefined
	{
		return this.client.commands.resolve(value);
	}

	public async resolve(message: Message, command: Command, name: string, value: string): Promise<Command>
	{
		const lang: string = await Lang.getLangFromMessage(message);
		const res: ResourceProxy = Lang.createResourceProxy(lang);

		const dm: boolean = message.channel.type !== 'text';
		const prefix: string = !dm ? await message.guild.storage!.settings.get('prefix') : '';
		const usage: string = Lang.getCommandInfo(command, lang).usage.replace(/<prefix>/g, prefix);

		const result: Command = this.resolveRaw(value)!;
		if (!result)
			throw new Error(res.RESOLVE_ERR_RESOLVE_TYPE_TEXT({ name, arg: value, usage, type: 'Command' }));

		return result;
	}
}
