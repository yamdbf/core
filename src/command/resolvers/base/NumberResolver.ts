import { Resolver } from '../Resolver';
import { Client } from '../../../client/Client';
import { Command } from '../../Command';
import { Message } from '../../../types/Message';
import { Lang } from '../../../localization/Lang';
import { ResourceLoader } from '../../../types/ResourceLoader';
import { BaseStrings as s } from '../../../localization/BaseStrings';

export class NumberResolver extends Resolver
{
	public constructor(client: Client)
	{
		super(client, 'Number');
	}

	public async validate(value: any): Promise<boolean>
	{
		return typeof value === 'number' && !isNaN(value) && isFinite(value);
	}

	public async resolve(message: Message, command: Command, name: string, value: string): Promise<number>
	{
		const dm: boolean = message.channel.type !== 'text';
		const lang: string = dm
			? this.client.defaultLang
			: await message.guild.storage.settings.get('lang')
				|| this.client.defaultLang;

		const res: ResourceLoader = Lang.createResourceLoader(lang);
		const prefix: string = !dm ? await message.guild.storage.settings.get('prefix') : '';
		const usage: string = Lang.getCommandInfo(command, lang).usage.replace('<prefix>', prefix);

		const result: number = parseFloat(value);
		if (!(await this.validate(result)))
			throw new Error(res(s.RESOLVE_ERR_RESOLVE_NUMBER, { name, arg: value, usage }));

		return result;
	}
}
