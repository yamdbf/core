import { Client } from '../../../client/Client';
import { Command } from '../../Command';
import { Lang } from '../../../localization/Lang';
import { Message } from '../../../types/Message';
import { Resolver } from '../Resolver';
import { ResourceProxy } from '../../../types/ResourceProxy';
import { isBoolean } from 'util';

export class BooleanResolver extends Resolver
{
	private readonly _truthy: Set<string>;
	private readonly _falsey: Set<string>;

	public constructor(client: Client)
	{
		super(client, 'Boolean', 'boolean');
		this._truthy = new Set(['true', 'on', 'y', 'yes', 'enable']);
		this._falsey = new Set(['false', 'off', 'n', 'no', 'disable']);
	}

	public validate(value: any): boolean
	{
		return isBoolean(value);
	}

	public resolveRaw(value: string): boolean | undefined
	{
		// eslint-disable-next-line no-param-reassign
		value = value.toLowerCase();
		if (this._truthy.has(value)) return true;
		if (this._falsey.has(value)) return false;
	}

	public async resolve(message: Message, command: Command, name: string, value: string): Promise<boolean>
	{
		const lang: string = await Lang.getLangFromMessage(message);
		const res: ResourceProxy = Lang.createResourceProxy(lang);

		const dm: boolean = message.channel.type === 'dm';
		const prefix: string = !dm ? await message.guild.storage!.settings.get('prefix') : '';
		const usage: string = Lang.getCommandInfo(command, lang).usage.replace(/<prefix>/g, prefix);

		const result: boolean = this.resolveRaw(value)!;
		if (!this.validate(result))
			throw new Error(res.RESOLVE_ERR_RESOLVE_BOOLEAN({ name, arg: value, usage }));

		return result;
	}
}
