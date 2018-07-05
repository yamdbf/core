import { Message } from '../../types/Message';
import { Command } from '../Command';
import { using } from '../CommandDecorators';
import { Middleware } from '../middleware/Middleware';
import { Util } from 'discord.js';
import { ResourceProxy } from '../../types/ResourceProxy';
const { resolve, expect, localize } = Middleware;

export default class extends Command
{
	public constructor()
	{
		super({
			name: 'shortcuts',
			desc: 'Configure or list command shortcuts',
			usage: `<prefix>shortcuts ['get'|'set'|'remove'] [name] [...content]`,
			info: `Shortcuts allow creating and calling preconfigured command+argument sets, or simple aliases

Example:
	<prefix>shortcuts set h help

Which would set the shortcut "h" to call the command "help"


Shortcuts also allow substitution tokens for argument interpolation.

Example:
	<prefix>shortcuts set add eval %s + %s

Which would set the shortcut "add", to add two numbers --
"<prefix>add 2 3", which becomes "<prefix>eval 2 + 3"

Of course the eval command is owner-only, but this should give you an idea of how shortcuts work`,
			callerPermissions: ['ADMINISTRATOR']
		});
	}

	@using(resolve(`action: ['get', 'set', 'remove'], name: String, ...content: String`))
	@using(function(this: Command, message, args: string[])
	{
		if (args[0])
		{
			if (args[0] === 'set')
				return expect(`action: ['get', 'set', 'remove'], name: String, ...content: String`)
					.call(this, message, args);

			else
				return expect(`action: ['get', 'set', 'remove'], name: String`)
					.call(this, message, args);
		}
		else return [message, args];
	})
	@using(localize)
	public async action(message: Message, [res, action, name, content]: [ResourceProxy, string, string, string]): Promise<any>
	{
		if (!action) return this.listShortcuts(message, res);
		else if (action === 'set') return this.setShortcut(message, res, name, content);
		else if (action === 'get') return this.getShortcut(message, res, name);
		else if (action === 'remove') return this.removeShortcut(message, res, name);
	}

	/**
	 * List command shortcuts
	 */
	private async listShortcuts(message: Message, res: ResourceProxy): Promise<void>
	{
		const shortcuts: { [name: string]: string } = await message.guild.storage!.settings.get('shortcuts') || {};
		const names: string[] = Object.keys(shortcuts);

		let output: string;

		if (names.length === 0) output = res.CMD_SHORTCUTS_ERR_NO_SHORTCUTS();
		else output = res.CMD_SHORTCUTS_LIST({ names: names.join(', ') });

		this.respond(message, output);
	}

	/**
	 * Set command shortcut content
	 */
	private async setShortcut(message: Message, res: ResourceProxy, name: string, content: string): Promise<any>
	{
		const shortcuts: { [name: string]: string } = await message.guild.storage!.settings.get('shortcuts') || {};
		if (Object.keys(shortcuts).length >= 50)
			return this.respond(message, res.CMD_SHORTCUTS_ERR_MAX_SHORTCUTS());

		if (content.length > 500)
			return this.respond(message, res.CMD_SHORTCUTS_ERR_SET_LENGTH());

		await message.guild.storage!.settings.set(`shortcuts.${name}`, content);

		content = Util.escapeMarkdown(content, true);
		return this.respond(message, res.CMD_SHORTCUTS_SET_SUCCESS({ name, content }));
	}

	/**
	 * Get command shortcut content
	 */
	private async getShortcut(message: Message, res: ResourceProxy, name: string): Promise<any>
	{
		const shortcuts: { [name: string]: string } = await message.guild.storage!.settings.get('shortcuts') || {};
		if (!shortcuts[name])
			return this.respond(message, res.CMD_SHORTCUTS_ERR_MISSING({ name }));

		const content: string = Util.escapeMarkdown(shortcuts[name], true);
		return this.respond(message, res.CMD_SHORTCUTS_GET_CONTENT({ name, content }));
	}

	/**
	 * Remove a command shortcut
	 */
	private async removeShortcut(message: Message, res: ResourceProxy, name: string): Promise<any>
	{
		const shortcuts: { [name: string]: string } = await message.guild.storage!.settings.get('shortcuts') || {};
		if (!shortcuts[name])
			return this.respond(message, res.CMD_SHORTCUTS_ERR_MISSING({ name }));

		await message.guild.storage!.settings.remove(`shortcuts.${name}`);
		return this.respond(message, res.CMD_SHORTCUTS_REMOVE_SUCCESS({ name }));
	}
}
