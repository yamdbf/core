import { GuildStorage } from '../../../types/GuildStorage';
import { ResourceLoader } from '../../../types/ResourceLoader';
import { Message } from '../../../types/Message';
import { Util } from '../../../util/Util';
import { Command } from '../../Command';
import { Middleware } from '../../middleware/Middleware';
import { Role } from 'discord.js';
import * as CommandDecorators from '../../CommandDecorators';
const { using, localizable } = CommandDecorators;

export default class extends Command
{
	public constructor()
	{
		super({
			name: 'limit',
			desc: 'Limit a command to the provided roles',
			usage: '<prefix>limit <command>, <role names, ...>',
			info: 'The comma after the command name -- before the role names list -- is necessary.',
			argOpts: { separator: ',' },
			callerPermissions: ['ADMINISTRATOR']
		});
	}

	@using(Middleware.expect({ '<command>': 'String' }))
	@localizable
	public async action(message: Message, [res, commandName, ...roleNames]: [ResourceLoader, string, string[]]): Promise<Message | Message[]>
	{
		const command: Command = this.client.commands.find(c =>
			Util.normalize(commandName) === Util.normalize(c.name));

		if (!command) return this.respond(message,
			res('CMD_LIMIT_ERR_UNKNOWN_COMMAND', { commandName }));
		if (command.group === 'base') return this.respond(message, res('CMD_LIMIT_ERR_INVALID_GROUP'));

		const storage: GuildStorage = message.guild.storage;
		let limitedCommands: { [name: string]: string[] } = await storage.settings.get('limitedCommands') || {};
		let newLimit: string[] = limitedCommands[command.name] || [];

		let roles: Role[] = [];
		let invalidRoles: string[] = [];
		for (const name of <string[]> roleNames)
		{
			let foundRole: Role = message.guild.roles.find(role => Util.normalize(role.name) === Util.normalize(name));
			if (!foundRole) invalidRoles.push(name);
			else if (foundRole && newLimit.includes(foundRole.id))
				message.channel.send(res('CMD_LIMIT_ERR_ALREADY_LIMITER',
					{ roleName: foundRole.name, commandName: command.name }));
			else roles.push(foundRole);
		}

		if (invalidRoles.length > 0) message.channel.send(res('CMD_LIMIT_ERR_INVALID_ROLE',
			{ invalidRoles: invalidRoles.map(r => `\`${r}\``).join(', ') }));
		if (roles.length === 0) return this.respond(message, res('CMD_LIMIT_ERR_NO_ROLES'));

		newLimit = newLimit.concat(roles.map(role => role.id));
		limitedCommands[command.name] = newLimit;
		await storage.settings.set('limitedCommands', limitedCommands);

		return this.respond(message, res('CMD_LIMIT_SUCCESS',
			{ roles: roles.map(r => `\`${r.name}\``).join(', '), commandName: command.name }));
	}
}
