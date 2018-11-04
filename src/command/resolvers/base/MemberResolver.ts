import { Resolver } from '../Resolver';
import { Client } from '../../../client/Client';
import { Command } from '../../Command';
import { Message } from '../../../types/Message';
import { Lang } from '../../../localization/Lang';
import { ResourceProxy } from '../../../types/ResourceProxy';
import { GuildMember, Collection } from 'discord.js';
import { Util } from '../../../util/Util';

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

	public async resolveRaw(value: string, context: Partial<Message> = {}): Promise<GuildMember | Collection<string, GuildMember> | undefined>
	{
		if (!context.guild) throw new Error('Cannot resolve given value: missing context');

		let member!: GuildMember;
		const idRegex: RegExp = /^(?:<@!?)?(\d+)>?$/;

		if (idRegex.test(value))
		{
			try
			{
				const userID: string = value.match(idRegex)![1];
				member = context.guild.members.get(userID) || await context.guild.members.fetch(userID);
			} catch {}
			if (!member) return;
		}
		else
		{
			const normalized: string = Util.normalize(value);
			let members: Collection<string, GuildMember> = context.guild.members.filter(a =>
				Util.normalize(a.displayName).includes(normalized)
					|| Util.normalize(a.user.username).includes(normalized)
					|| Util.normalize(a.user.tag).includes(normalized));

			if (members.size === 1) member = members.first()!;
			else return members;
		}

		return member;
	}

	public async resolve(message: Message, command: Command, name: string, value: string): Promise<GuildMember>
	{
		const lang: string = await Lang.getLangFromMessage(message);
		const res: ResourceProxy = Lang.createResourceProxy(lang);

		const dm: boolean = message.channel.type !== 'text';
		const prefix: string = !dm ? await message.guild.storage!.settings.get('prefix') : '';
		const usage: string = Lang.getCommandInfo(command, lang).usage.replace(/<prefix>/g, prefix);

		const idRegex: RegExp = /^(?:<@!?)?(\d+)>?$/;

		let member: GuildMember | Collection<string, GuildMember> = (await this.resolveRaw(value, message))!;
		if (idRegex.test(value))
		{
			if (!member)
				throw new Error(res.RESOLVE_ERR_RESOLVE_TYPE_ID({ name, arg: value, usage, type: 'Member' }));
		}
		else
		{
			if (member instanceof Collection)
			{
				if (member.size > 1)
					throw String(res.RESOLVE_ERR_MULTIPLE_USER_RESULTS({
						name,
						usage,
						users: member.map(m => `\`${m.user.tag}\``).join(', ')
					}));

				member = member.first()!;
			}

			if (!member)
				throw new Error(res.RESOLVE_ERR_RESOLVE_TYPE_TEXT({ name, arg: value, usage, type: 'Member' }));
		}

		return member as GuildMember;
	}
}
