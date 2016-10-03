'use babel';
'use strict';

import Command from './Command';

export default class CommandDispatcher
{
	constructor(bot)
	{
		this.bot = bot;

		this.bot.on('message', message =>
		{
			let config = this.bot.config;
			if (this.bot.selfbot && message.author !== this.bot.user) return;
			if (message.author.bot) return;
			let dm = message.channel.type === 'dm';
			let duplicateMention;
			let regexMentions = message.content.match(/<@!?\d+>/g);
			if (regexMentions && regexMentions.length > 1)
			{
				let firstMention = regexMentions.shift();
				duplicateMention = regexMentions.includes(firstMention);
			}
			let mentions;
			mentions = message.mentions.users.array().sort((a, b) =>
				message.content.indexOf(a.id) - message.content.indexOf(b.id));
			let botMention = mentions.length > 0
				&& (!dm && !message.content.startsWith(this.bot.getPrefix(message.guild)))
				&& mentions[0].id === this.bot.user.id
				&& !this.bot.selfbot;
			let command;

			if (botMention && !duplicateMention)
			{
				command = message.content.replace(/<@!?\d+>/, '').trim();
				mentions = mentions.slice(1);
			}
			else if (botMention && duplicateMention)
			{
				command = message.content.replace(/<@!?\d+>/, '').trim();
			}
			else if (!dm && message.content.startsWith(this.bot.getPrefix(message.guild)))
			{
				command = message.content.slice(
					this.bot.getPrefix(message.guild).length).trim();
			}
			else if (dm)
			{
				if (/<@!?\d+>.+/.test(message.content))
				{
					command = message.content.replace(/<@!?\d+>/, '').trim();
					mentions = mentions.slice(1);
				}
				else
				{
					command = message.content.trim();
				}
			}
			else
			{
				return;
			}
			message.content = command;

			let commandMatchFound = false;
			let wrongChannel = false;
			this.bot.commands.forEach(item =>
			{
				if (item instanceof Command && item.command.test(command))
				{
					if (!dm && this.bot.guildStorages.get(message.guild)
						.getSetting('disabledGroups').includes(item.group)) return;
					if (item.ownerOnly && !config.owner.includes(message.author.id)) return;
					if (dm && item.guildOnly)
					{
						message.channel.sendMessage(``
							+ `That command is for servers only. Try saying "help" to see a `
							+ `list of commands you can use in this DM`);
						wrongChannel = true;
						return;
					}
					if (!dm && item.permissions.length > 0)
					{
						let missingPermissions = [];
						item.permissions.forEach(permission =>
						{
							if (!dm && !message.channel // eslint-disable-line curly
								.permissionsFor(message.author)
								.hasPermission(permission))
								missingPermissions.push(permission);
						});

						if (missingPermissions.length > 0)
						{
							message[`${this.bot.selfbot ? 'channel' : 'author'}`].sendMessage(``
								+ `**You're missing the following permission`
								+ `${missingPermissions.length > 1 ? 's' : ''} `
								+ `for that command:**\n\`\`\`css\n`
								+ `${missingPermissions.join(', ')}\n\`\`\``)
									.then(response =>
									{
										if (this.bot.selfbot) response.delete(10 * 1000);
									});
							return;
						}
					}
					if (!dm && item.roles.length > 0)
					{
						let matchedRoles = message.member.roles
							.filter(role => item.roles.includes(role.name));
						if (!matchedRoles.size > 0)
						{
							message[`${this.bot.selfbot ? 'channel' : 'author'}`].sendMessage(``
								+ `**You must have ${item.roles.length > 1
									? 'one of the following roles' : 'the following role'}`
								+ ` to use that command:**\n\`\`\`css\n`
								+ `${item.roles.join(', ')}\n\`\`\``)
									.then(response =>
									{
										if (this.bot.selfbot) response.delete(10 * 1000);
									});
							return;
						}
					}
					let args = message.content.match(item.command)
						.filter(match => typeof match === 'string').slice(1)
						.map(a => !isNaN(a) ? parseFloat(a) : a);

					commandMatchFound = true;
					this.dispatch(item, message, args, mentions);
				}
			});
			if (dm && !commandMatchFound && !wrongChannel)
			{
				message.channel.sendMessage(``
					+ `Sorry, I didn't recognize any command in your message.\n`
					+ `Try saying "help" to view a list of commands you can use in `
					+ `this DM, or try calling the\nhelp command in a server channel `
					+ `to see what commands you can use there!`);
			}
		});
	}

	async dispatch(command, message, args, mentions)
	{
		await command.action(message, args, mentions).catch(console.log); // eslint-disable-line no-unused-expressions, no-console
	}
}
