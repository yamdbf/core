import { Resolver } from '../Resolver';
import { Client } from '../../../client/Client';
import { Command } from '../../Command';
import { Message } from '../../../types/Message';
import { Lang } from '../../../localization/Lang';
import { ResourceProxy } from '../../../types/ResourceProxy';
import { GuildMember, Collection } from 'discord.js';

export class MemberResolver extends Resolver
{
	public constructor(client: Client)
	{
		super(client, 'Member', 'GuildMember');
	}

	public async validate(value: any): Promise<boolean>
	{
		return value instanceof GuildMember;
	}

	public async resolve(message: Message, command: Command, name: string, value: string): Promise<GuildMember>
	{
		const lang: string = await Lang.getLangFromMessage(message);
		const res: ResourceProxy = Lang.createResourceProxy(lang);

		const dm: boolean = message.channel.type !== 'text';
		const prefix: string = !dm ? await message.guild.storage.settings.get('prefix') : '';
		const usage: string = Lang.getCommandInfo(command, lang).usage.replace(/<prefix>/g, prefix);

		const idRegex: RegExp = /^(?:<@!?)?(\d+)>?$/;
		const normalizeUser: (text: string) => string =
			text => text.toLowerCase().replace(/[^a-z0-9#]+/g, '');

		let member: GuildMember;
		if (idRegex.test(value))
		{
			try { member = await message.guild.fetchMember(value.match(idRegex)[1]); }
			catch {}
			if (!member)
				throw new Error(res.RESOLVE_ERR_RESOLVE_TYPE_ID({ name, arg: value, usage, type: 'Member' }));
		}
		else
		{
			const normalized: string = normalizeUser(value);
			let members: Collection<string, GuildMember> = message.guild.members.filter(a =>
				normalizeUser(a.displayName).includes(normalized)
					|| normalizeUser(a.user.username).includes(normalized)
					|| normalizeUser(a.user.tag).includes(normalized));

			if (members.size > 1)
				throw String(res.RESOLVE_ERR_MULTIPLE_USER_RESULTS({
					name,
					usage,
					users: members.map(m => `\`${m.user.tag}\``).join(', ')
				}));

			member = members.first();
			if (!member)
				throw new Error(res.RESOLVE_ERR_RESOLVE_TYPE_TEXT({ name, arg: value, usage, type: 'Member' }));
		}

		return member;
	}
}
