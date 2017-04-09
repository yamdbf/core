import { Client } from '../../../client/Client';
import { GuildStorage } from '../../../types/GuildStorage';
import { Message } from '../../../types/Message';
import { Util } from '../../../util/Util';
import { Command } from '../../Command';
import { Middleware } from '../../middleware/Middleware';
import { Role } from 'discord.js';
import * as CommandDecorators from '../../CommandDecorators';
const { using } = CommandDecorators;

export default class extends Command<Client>
{
	public constructor(client: Client)
	{
		super(client, {
			name: 'limit',
			description: 'Limit a command to the provided roles',
			usage: '<prefix>limit <command>, <role names, ...>',
			extraHelp: 'The comma after the command name -- before the role names list -- is necessary.',
			argOpts: { separator: ',' },
			permissions: ['ADMINISTRATOR']
		});
	}

	@using(Middleware.expect({ '<command>': 'String' }))
	public async action(message: Message, [commandName, ...roleNames]: [string, string]): Promise<Message | Message[]>
	{
		const command: Command<Client> = this.client.commands.find(c => Util.normalize(commandName) === Util.normalize(c.name));
		if (!command) return this.respond(message, `Failed to find a command with the name \`${commandName}\``);
		if (command.group === 'base') this.respond(message, `Cannot limit base commands.`);

		const storage: GuildStorage = message.guild.storage;
		let limitedCommands: { [name: string]: string[] } = await storage.settings.get('limitedCommands') || {};
		let newLimit: string[] = limitedCommands[command.name] || [];

		let roles: Role[] = [];
		let invalidRoles: string[] = [];
		for (const name of roleNames)
		{
			let foundRole: Role = message.guild.roles.find(role => Util.normalize(role.name) === Util.normalize(name));
			if (!foundRole) invalidRoles.push(name);
			else if (foundRole && newLimit.includes(foundRole.id)) message.channel.send(
				`Role \`${foundRole.name}\` is already a limiter for command: \`${command.name}\``);
			else roles.push(foundRole);
		}

		if (invalidRoles.length > 0) message.channel.send(`Couldn't find role${
			invalidRoles.length > 1 ? 's' : ''}: \`${invalidRoles.join('`, `')}\``);
		if (roles.length === 0) return this.respond(message, `Failed to add any roles to the command.`);

		newLimit = newLimit.concat(roles.map(role => role.id));
		limitedCommands[command.name] = newLimit;
		await storage.settings.set('limitedCommands', limitedCommands);

		return this.respond(message, `Successfully added role${roles.length > 1 ? 's' : ''}: \`${
			roles.map(role => role.name).join('`, `')}\` to the limiter for command: \`${command.name}\``);
	}
}
