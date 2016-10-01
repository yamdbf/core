'use babel';
'use strict';

import Command from './Command';

export default class CommandDispatcher
{
	constructor(bot)
	{
		this.bot = bot;
		let settings = require('../../settings.json');

		this.bot.on('message', message =>
		{
			if (settings.selfbot && message.author !== this.bot.user) return;
			if (message.author.bot) return;
			let botMention = message.mentions.users.size > 0
				&& message.mentions.users.first().id === this.bot.user.id
				&& !settings.selfbot;

			let command;
			if (botMention)
			{
				command = message.content.replace(/<@!?\d+>/, '').trim();
			}
			else if (message.content.startsWith(this.bot.getPrefix(message.guild)))
			{
				command = message.content.slice(
					this.bot.getPrefix(message.guild).length).trim();
			}
			else
			{
				return;
			}
			message.content = command;

			this.bot.commands.forEach(item =>
			{
				if (item instanceof Command && command.match(item.command))
				{
					if (this.bot.guildStorages.get(message.guild)
						.getSetting('disabledGroups').includes(item.group)) return;
					if (item.ownerOnly && !settings.owner.includes(message.author.id)) return;
					if (item.permissions.length > 0)
					{
						let missingPermissions = [];
						item.permissions.forEach(permission =>
						{
							if (!message.channel // eslint-disable-line curly
								.permissionsFor(message.author)
								.hasPermission(permission))
								missingPermissions.push(permission);
						});

						if (missingPermissions.length > 0)
						{
							message.channel.sendMessage(``
								+ `**You're missing the following permission`
								+ `${missingPermissions.length > 1 ? 's' : ''} `
								+ `for that command:**\n\`\`\`css\n`
								+ `${missingPermissions.join(', ')}\n\`\`\``)
									.then(response => response.delete(10 * 1000));
							return;
						}
					}
					if (item.roles.length > 0)
					{
						let matchedRoles = message.member.roles
							.filter(role => item.roles.includes(role.name));
						if (!matchedRoles.size > 0)
						{
							message.channel.sendMessage(``
								+ `**You must have ${item.roles.length > 1
									? 'one of the following roles' : 'the following role'}`
								+ ` to use that command:**\n\`\`\`css\n`
								+ `${item.roles.join(', ')}\n\`\`\``)
									.then(response => response.delete(10 * 1000));
							return;
						}
					}

					item.action().then(console.log('action complete')); // eslint-disable-line no-console
					return;
				}
			});
		});
	}
}
