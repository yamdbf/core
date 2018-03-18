import { Resolver } from '../Resolver';
import { Client } from '../../../client/Client';
import { Command } from '../../Command';
import { Message } from '../../../types/Message';
import { Lang } from '../../../localization/Lang';
import { ResourceProxy } from '../../../types/ResourceProxy';
import { Role, Collection } from 'discord.js';
import { Util } from '../../../util/Util';

export class RoleResolver extends Resolver
{
	public constructor(client: Client)
	{
		super(client, 'Role');
	}

	public async validate(value: any): Promise<boolean>
	{
		return value instanceof Role;
	}

	public async resolve(message: Message, command: Command, name: string, value: string): Promise<Role>
	{
		const lang: string = await Lang.getLangFromMessage(message);
		const res: ResourceProxy = Lang.createResourceProxy(lang);

		const dm: boolean = message.channel.type !== 'text';
		const prefix: string = !dm ? await message.guild.storage.settings.get('prefix') : '';
		const usage: string = Lang.getCommandInfo(command, lang).usage.replace(/<prefix>/g, prefix);

		const roleRegex: RegExp = /^(?:<@&)?(\d+)>?$/;

		let role: Role;
		if (roleRegex.test(value))
		{
			const id: string = value.match(roleRegex)[1];
			role = message.guild.roles.get(id);
			if (!role)
				throw new Error(res.RESOLVE_ERR_RESOLVE_TYPE_ID({ name, arg: value, usage, type: 'Role' }));
		}
		else
		{
			const normalized: string = Util.normalize(value);
			let roles: Collection<string, Role> = message.guild.roles.filter(a =>
				Util.normalize(a.name).includes(normalized));

			if (roles.size > 1)
				throw String(res.RESOLVE_ERR_MULTIPLE_ROLE_RESULTS({
					name,
					usage,
					roles: roles.map(r => `\`${r.name}\``).join(', ')
				}));

			role = roles.first();
			if (!role)
				throw new Error(res.RESOLVE_ERR_RESOLVE_TYPE_TEXT({ name, arg: value, usage, type: 'Role' }));
		}

		return role;
	}
}
