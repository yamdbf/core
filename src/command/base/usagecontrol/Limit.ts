import { GuildStorage } from '../../../storage/GuildStorage';
import { ResourceLoader } from '../../../types/ResourceLoader';
import { BaseStrings as s } from '../../../localization/BaseStrings';
import { Message } from '../../../types/Message';
import { Command } from '../../Command';
import { Middleware } from '../../middleware/Middleware';
import { Role } from 'discord.js';
import * as CommandDecorators from '../../CommandDecorators';
import { Resolver } from '../../resolvers/Resolver';
const { using, localizable } = CommandDecorators;
const { expect, resolve } = Middleware;

export default class extends Command
{
	public constructor()
	{
		super({
			name: 'limit',
			desc: 'Limit commands to certain roles',
			usage: `<prefix>limit <command> <roles, ...> | <prefix>limit <'clear'> <command>`,
			info: `Multiple roles can be passed to the command as a comma-separated list.

If a role is unable to be found and you know it exists, it could be that there are multiple roles containing the given role name search text. Consider refining your search, or using an @mention for the role you want to use.

Limiting a command will add the given roles to set of roles the command is limited to.

Use '<prefix>limit clear <command>' to clear all of the roles a command is limited to.

Removing individual roles is not possible to keep the command simple to use.`,
			callerPermissions: ['ADMINISTRATOR']
		});
	}

	@using(function(message, args)
	{
		if (args[0] === 'clear')
			return resolve(`clear: String, command: Command`)
				.call(this, message, args);
		else
			return resolve(`command: Command, ...roles: String`)
				.call(this, message, args);
	})
	@using(function(message, args)
	{
		if (args[0] === 'clear')
			return expect(`clear: String, command: Command`)
				.call(this, message, args);
		else
			return expect(`command: Command, ...roles: String`)
				.call(this, message, args);
	})
	@localizable
	public async action(message: Message, [res, clearOrCommand, rolesOrCommand]: [ResourceLoader, Command | string, Command | string]): Promise<any>
	{
		if (clearOrCommand === 'clear') return this.clearLimit(message, res, <Command> rolesOrCommand);
		else return this.limitCommand(message, res, <Command> clearOrCommand, <string> rolesOrCommand);
	}

	/**
	 * Clear all roles limiting the given command
	 */
	public async clearLimit(message: Message, res: ResourceLoader, command: Command): Promise<any>
	{
		const storage: GuildStorage = message.guild.storage;
		let limitedCommands: { [name: string]: string[] } = await storage.settings.get('limitedCommands') || {};
		delete limitedCommands[command.name];
		storage.settings.set('limitedCommands', limitedCommands);

		return this.respond(message,
			res(s.CMD_LIMIT_CLEAR_SUCCESS, { commandName: command.name }));
	}

	/**
	 * Add the given roles to the limiter for the given command
	 */
	public async limitCommand(message: Message, res: ResourceLoader, command: Command, roles: string): Promise<any>
	{
		if (command.group === 'base') return this.respond(message, res(s.CMD_LIMIT_ERR_INVALID_GROUP));

		const roleResolver: Resolver = this.client.resolvers.get('Role');
		const roleStrings: string[] = roles.split(/ *, */).filter(r => r !== '' && r !== ',');

		const foundRoles: Role[] = [];
		const invalidRoles: string[] = [];

		for (const roleString of roleStrings)
			try
			{
				const role: Role = await roleResolver.resolve(message, this, 'role', roleString);
				foundRoles.push(role);
			}
			catch { invalidRoles.push(roleString); }

		if (invalidRoles.length > 0) message.channel.send(res(s.CMD_LIMIT_ERR_INVALID_ROLE,
			{ invalidRoles: invalidRoles.map(r => `\`${r}\``).join(', ') }));

		if (foundRoles.length === 0) return this.respond(message, res(s.CMD_LIMIT_ERR_NO_ROLES));

		const storage: GuildStorage = message.guild.storage;
		const limitedCommands: { [name: string]: string[] } = await storage.settings.get('limitedCommands') || {};
		const newLimit: Set<string> = new Set(limitedCommands[command.name] || []);

		for (const role of foundRoles) newLimit.add(role.id);
		limitedCommands[command.name] = Array.from(newLimit);

		return this.respond(message, res(s.CMD_LIMIT_SUCCESS,
			{ roles: foundRoles.map(r => `\`${r.name}\``).join(', '), commandName: command.name }));
	}
}
