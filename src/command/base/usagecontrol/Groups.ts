/* eslint-disable func-names */
import { Command } from '../../Command';
import { Lang } from '../../../localization/Lang';
import { Message } from '../../../types/Message';
import { Middleware } from '../../middleware/Middleware';
import { ResourceProxy } from '../../../types/ResourceProxy';
import { using } from '../../CommandDecorators';
const { resolve, expect, localize } = Middleware;

export default class extends Command
{
	public constructor()
	{
		super({
			name: 'groups',
			desc: 'Configure or list command groups',
			usage: '<prefix>groups [\'enable\'|\'on\'|\'disable\'|\'off\'] [...group]',
			info: 'A \'*\' denotes a disabled group when listing all command groups.',
			callerPermissions: ['ADMINISTRATOR']
		});
	}

	@using(resolve('action: [\'enable\', \'on\', \'disable\', \'off\'], ...group: String'))
	@using(function(this: Command, message: Message, args: string[])
	{
		if (args[0])
			return expect('action: [\'enable\', \'on\', \'disable\', \'off\'], ...group: String')
				.call(this, message, args);

		return [message, args];
	})
	@using(localize)
	public async action(message: Message, [res, action, group]: [ResourceProxy, string, string]): Promise<any>
	{
		if (!action) return this._listGroups(message, res);
		else if (['enable', 'on'].includes(action)) return this._enableGroup(message, res, group);
		else if (['disable', 'off'].includes(action)) return this._disableGroup(message, res, group);
	}

	/**
	 * List command groups
	 */
	private async _listGroups(message: Message, res: ResourceProxy): Promise<void>
	{
		const lang: string = await message.guild.storage!.settings.get('lang') || this.client.defaultLang;
		const info: string[] = this.client.commands.groups.map(g => Lang.getGroupInfo(g, lang));
		const disabledGroups: string[] = await message.guild.storage!.settings.get('disabledGroups') || [];

		const output: string = res.CMD_GROUPS_LIST({
			groups: this.client.commands.groups,
			disabledGroups,
			info
		});

		this.respond(message, output);
	}

	/**
	 * Enable a command group
	 */
	private async _enableGroup(message: Message, res: ResourceProxy, group: string): Promise<any>
	{
		const err: { [error: string]: string } = {
			NO_EXIST: res.CMD_GROUPS_ERR_NOEXIST({ group }),
			ENABLED: res.CMD_GROUPS_ERR_ENABLED({ group })
		};

		if (!this.client.commands.groups.includes(group)) return this.respond(message, err.NO_EXIST);
		const disabledGroups: string[] = await message.guild.storage!.settings.get('disabledGroups') || [];
		if (group === 'base' || !disabledGroups.includes(group))
			return this.respond(message, err.ENABLED);

		disabledGroups.splice(disabledGroups.indexOf(group), 1);
		await message.guild.storage!.settings.set('disabledGroups', disabledGroups);

		this.respond(message, res.CMD_GROUPS_ENABLE_SUCCESS({ group }));
	}

	/**
	 * Disable a command group
	 */
	private async _disableGroup(message: Message, res: ResourceProxy, group: string): Promise<any>
	{
		const err: { [error: string]: string } = {
			NO_EXIST: res.CMD_GROUPS_ERR_NOEXIST({ group }),
			DISABLED: res.CMD_GROUPS_ERR_DISABLED({ group })
		};

		if (!this.client.commands.groups.includes(group)) return this.respond(message, err.NO_EXIST);
		const disabledGroups: string[] = await message.guild.storage!.settings.get('disabledGroups') || [];
		if (group === 'base' || disabledGroups.includes(group))
			return this.respond(message, err.DISABLED);

		disabledGroups.push(group);
		await message.guild.storage!.settings.set('disabledGroups', disabledGroups);

		this.respond(message, res.CMD_GROUPS_DISABLE_SUCCESS({ group }));
	}
}
