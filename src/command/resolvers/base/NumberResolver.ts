import { Resolver } from '../Resolver';
import { Client } from '../../../client/Client';
import { Command } from '../../Command';
import { Message } from '../../../types/Message';
import { Lang } from '../../../localization/Lang';
import { ResourceProxy } from '../../../types/ResourceProxy';

export class NumberResolver extends Resolver
{
	public constructor(client: Client)
	{
		super(client, 'Number', 'number');
	}

	public validate(value: any): boolean
	{
		return typeof value === 'number' && !isNaN(value) && isFinite(value);
	}

	public resolveRaw(value: string): number
	{
		return parseFloat(value);
	}

	public async resolve(message: Message, command: Command, name: string, value: string): Promise<number>
	{
		const lang: string = await Lang.getLangFromMessage(message);
		const res: ResourceProxy = Lang.createResourceProxy(lang);

		const dm: boolean = message.channel.type !== 'text';
		const prefix: string = !dm ? await message.guild.storage!.settings.get('prefix') : '';
		const usage: string = Lang.getCommandInfo(command, lang).usage.replace(/<prefix>/g, prefix);

		const result: number = this.resolveRaw(value);
		if (!(this.validate(result)))
			throw new Error(res.RESOLVE_ERR_RESOLVE_NUMBER({ name, arg: value, usage }));

		return result;
	}
}
