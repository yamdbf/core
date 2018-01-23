import { Message } from '../../../types/Message';
import { Command } from '../../Command';
import { localizable, using } from '../../CommandDecorators';
import { ResourceLoader } from '../../../types/ResourceLoader';
import { BaseStrings as s } from '../../../localization/BaseStrings';
import { Middleware } from '../../middleware/Middleware';
import { Lang } from '../../../localization/Lang';
const { resolve, expect, } = Middleware;

export default class extends Command
{
	public constructor()
	{
		super({
			name: 'groups',
			desc: 'Configure or list command groups',
			usage: `<prefix>groups ['enable'|'on'|'disable'|'off'] [...group]`,
			info: `A '*' denotes a disabled group when listing all command groups.`,
			callerPermissions: ['ADMINISTRATOR']
		});
	}

	@using(resolve(`action: ['enable', 'on', 'disable', 'off'], ...group: String`))
	@using(function(message, args: string[])
	{
		if (args[0])
			return expect(`action: ['enable', 'on', 'disable', 'off'], ...group: String`)
				.call(this, message, args);
		else return [message, args];
	})
	@localizable
	public async action(message: Message, [res, action, group]: [ResourceLoader, string, string]): Promise<any>
	{
		if (!action) return this.listGroups(message, res);
		else if (['enable', 'on'].includes(action)) return this.enableGroup(message, res, group);
		else if (['disable', 'off'].includes(action)) return this.disableGroup(message, res, group);
	}

	/**
	 * List command groups
	 */
	private async listGroups(message: Message, res: ResourceLoader): Promise<void>
	{
		const lang: string = await message.guild.storage.settings.get('lang');
		const info: string[] = this.client.commands.groups.map(g => Lang.getGroupInfo(g, lang));
		const disabledGroups: string[] = await message.guild.storage.settings.get('disabledGroups') || [];

		const output: string = res(s.CMD_GROUPS_LIST, {
			groups: this.client.commands.groups.join(', '),
			disabledGroups: disabledGroups.join(', '),
			info: info.join('::::')
		});

		this.respond(message, output);
	}

	/**
	 * Enable a command group
	 */
	private async enableGroup(message: Message, res: ResourceLoader, group: string): Promise<any>
	{
		const err: { [error: string]: string } = {
			NO_EXIST: res(s.CMD_GROUPS_ERR_NOEXIST, { group }),
			ENABLED: res(s.CMD_GROUPS_ERR_ENABLED, { group })
		};

		if (!this.client.commands.groups.includes(group)) return this.respond(message, err.NO_EXIST);
		const disabledGroups: string[] = await message.guild.storage.settings.get('disabledGroups') || [];
		if (group === 'base' || !disabledGroups.includes(group))
			return this.respond(message, err.ENABLED);

		disabledGroups.splice(disabledGroups.indexOf(group), 1);
		await message.guild.storage.settings.set('disabledGroups', disabledGroups);

		this.respond(message, res(s.CMD_GROUPS_ENABLE_SUCCESS, { group }));
	}

	/**
	 * Disable a command group
	 */
	private async disableGroup(message: Message, res: ResourceLoader, group: string): Promise<any>
	{
		const err: { [error: string]: string } = {
			NO_EXIST: res(s.CMD_GROUPS_ERR_NOEXIST, { group }),
			DISABLED: res(s.CMD_GROUPS_ERR_DISABLED, { group })
		};

		if (!this.client.commands.groups.includes(group)) return this.respond(message, err.NO_EXIST);
		const disabledGroups: string[] = await message.guild.storage.settings.get('disabledGroups') || [];
		if (group === 'base' || disabledGroups.includes(group))
			return this.respond(message, err.DISABLED);

		disabledGroups.push(group);
		await message.guild.storage.settings.set('disabledGroups', disabledGroups);

		this.respond(message, res(s.CMD_GROUPS_DISABLE_SUCCESS, { group }));
	}
}
