import { Role, Collection } from 'discord.js';
import { Command } from '../../Command';
import { Message } from '../../../types/Message';
import { ResourceProxy } from '../../../types/ResourceProxy';
import { Middleware } from '../../middleware/Middleware';
import { GuildStorage } from '../../../storage/GuildStorage';
import { Resolver } from '../../resolvers/Resolver';
import { using } from '../../CommandDecorators';
const { expect, resolve, localize } = Middleware;

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

	@using(function(this: Command, message, args)
	{
		if (args[0] === 'clear')
			return resolve(`clear: String, command: Command`)
				.call(this, message, args);
		else
			return resolve(`command: Command, ...roles: String`)
				.call(this, message, args);
	})
	@using(function(this: Command, message, args)
	{
		if (args[0] === 'clear')
			return expect(`clear: String, command: Command`)
				.call(this, message, args);
		else
			return expect(`command: Command, ...roles: String`)
				.call(this, message, args);
	})
	@using(localize)
	public async action(message: Message, [res, clearOrCommand, rolesOrCommand]: [ResourceProxy, Command | string, Command | string]): Promise<any>
	{
		if (clearOrCommand === 'clear') return this.clearLimit(message, res, rolesOrCommand as Command);
		else return this.limitCommand(message, res, clearOrCommand as Command, rolesOrCommand as string);
	}

	/**
	 * Clear all roles limiting the given command
	 */
	public async clearLimit(message: Message, res: ResourceProxy, command: Command): Promise<any>
	{
		await message.guild.storage!.settings.remove(`limitedCommands.${command.name}`);
		return this.respond(message,
			res.CMD_LIMIT_CLEAR_SUCCESS({ commandName: command.name }));
	}

	/**
	 * Add the given roles to the limiter for the given command
	 */
	public async limitCommand(message: Message, res: ResourceProxy, command: Command, roles: string): Promise<any>
	{
		if (command.group === 'base') return this.respond(message, res.CMD_LIMIT_ERR_INVALID_GROUP());

		const roleResolver: Resolver = this.client.resolvers.get('Role');
		const roleStrings: string[] = roles.split(/ *, */).filter(r => r !== '' && r !== ',');

		const foundRoles: Role[] = [];
		const invalidRoles: string[] = [];

		for (const roleString of roleStrings)
		{
			const role: Role | Collection<string, Role> = await roleResolver.resolveRaw(roleString, message);
			if (!role || role instanceof Collection) invalidRoles.push(roleString);
			else foundRoles.push(role);
		}

		if (invalidRoles.length > 0) message.channel
			.send(res.CMD_LIMIT_ERR_INVALID_ROLE({ invalidRoles: invalidRoles.map(r => `\`${r}\``).join(', ') }));

		if (foundRoles.length === 0) return this.respond(message, res.CMD_LIMIT_ERR_NO_ROLES());

		const storage: GuildStorage = message.guild.storage!;
		const newLimit: Set<string> =
			new Set(await storage.settings.get(`limitedCommands.${command.name}`) || []);

		for (const role of foundRoles) newLimit.add(role.id);
		await storage.settings.set(`limitedCommands.${command.name}`, Array.from(newLimit));

		return this.respond(message, res.CMD_LIMIT_SUCCESS({
			roles: foundRoles.map(r => `\`${r.name}\``).join(', '),
			commandName: command.name
		}));
	}
}
