'use babel';
'use strict';

export default class CommandDispatcher
{
	constructor(bot)
	{
		this.bot = bot;

		this.bot.on('message', message =>
		{
			this.handleMessage(message);
		});
	}

	handleMessage(message)
	{
		let config = this.bot.config;
		if (this.bot.selfbot && message.author !== this.bot.user) return false;
		if (message.author.bot) return false;

		let { command, mentions, args, content, dm, original } = this.processContent(message);
		message.content = content;

		if (dm && !command)	return this.commandNotFoundError(message);
		else if (!command) return false;

		if (!dm && this.bot.guildStorages.get(message.guild)
			.getSetting('disabledGroups').includes(command.group)) return false;
		if (command.ownerOnly && !config.owner.includes(message.author.id)) return false;
		if (dm && command.guildOnly) return this.guildOnlyError(message);

		let missingPermissions = this.checkPermissions(dm, message, command);
		if (missingPermissions.length > 0) return this.missingPermissionsError(missingPermissions, message);

		if (!this.hasRoles(dm, message, command)) return this.missingRolesError(message, command);

		return this.dispatch(command, message, args, mentions, original);
	}

	processContent(message)
	{
		let original = message.content;
		let dm = message.channel.type === 'dm';
		let mentions;
		let duplicateMention;
		let regexMentions = message.content.match(/<@!?\d+>/g);
		if (regexMentions && regexMentions.length > 1)
		{
			let firstMention = regexMentions.shift();
			duplicateMention = regexMentions.includes(firstMention);
		}
		mentions = message.mentions.users.array().sort((a, b) =>
			message.content.indexOf(a.id) - message.content.indexOf(b.id));

		let botMention = mentions.length > 0
			&& (!dm && !message.content.startsWith(this.bot.getPrefix(message.guild)))
			&& mentions[0].id === this.bot.user.id
			&& !this.bot.selfbot;

		let content;
		if (botMention && !duplicateMention)
		{
			content = message.content.replace(/<@!?\d+>/g, '').trim();
			mentions = mentions.slice(1);
		}
		else if (botMention && duplicateMention)
		{
			content = message.content.replace(/<@!?\d+>/g, '').trim();
		}
		else if (!dm && message.content.startsWith(this.bot.getPrefix(message.guild)))
		{
			content = message.content.slice(
				this.bot.getPrefix(message.guild).length).replace(/<@!?\d+>/g, '').trim();
		}
		else if (dm)
		{
			if (/<@!?\d+>.+/.test(message.content))
			{
				content = message.content.replace(/<@!?\d+>/g, '').trim();
				mentions = mentions.slice(1);
			}
			else
			{
				content = message.content.trim();
			}
		}
		else
		{
			return false;
		}
		content = content.replace(/ +/g, ' ');

		let commandName = content.split(' ')[0];
		let args = content.match(/(\w+)|("|')(?:(?!\2).)+\2/g).slice(1)
			.map(a => !isNaN(a) ? parseFloat(a) : a.replace(/("|')(.+)\1/, '$2'));

		let command = this.bot.commands.filter(c =>
			c.name === commandName || c.aliases.includes(commandName)).first();

		return { command: command, mentions: mentions, args: args, content: content, dm: dm, original: original };
	}

	checkPermissions(dm, message, command)
	{
		let missing = [];
		command.permissions.forEach(permission =>
		{
			if (!dm && !message.channel // eslint-disable-line curly
				.permissionsFor(message.author)
				.hasPermission(permission))
				missing.push(permission);
		});
		return missing;
	}

	hasRoles(dm, message, command)
	{
		if (command.roles.length === 0) return true;
		let matchedRoles = message.member.roles
			.filter(role => !dm && command.roles.includes(role.name));
		if (matchedRoles.size > 0) return true;
		return false;
	}

	commandNotFoundError(message)
	{
		return message.channel.sendMessage(``
			+ `Sorry, I didn't recognize any command in your message.\n`
			+ `Try saying "help" to view a list of commands you can use in `
			+ `this DM, or try calling the\nhelp command in a server channel `
			+ `to see what commands you can use there!`);
	}

	guildOnlyError(message)
	{
		return message.channel.sendMessage(``
			+ `That command is for servers only. Try saying "help" to see a `
			+ `list of commands you can use in this DM`);
	}

	missingPermissionsError(missing, message)
	{
		return message[`${this.bot.selfbot ? 'channel' : 'author'}`].sendMessage(``
			+ `**You're missing the following permission`
			+ `${missing.length > 1 ? 's' : ''} `
			+ `for that command:**\n\`\`\`css\n`
			+ `${missing.join(', ')}\n\`\`\``)
				.then(response =>
				{
					if (this.bot.selfbot) response.delete(10 * 1000);
				});
	}

	missingRolesError(message, command)
	{
		return message[`${this.bot.selfbot ? 'channel' : 'author'}`].sendMessage(``
			+ `**You must have ${command.roles.length > 1
				? 'one of the following roles' : 'the following role'}`
			+ ` to use that command:**\n\`\`\`css\n`
			+ `${command.roles.join(', ')}\n\`\`\``)
				.then(response =>
				{
					if (this.bot.selfbot) response.delete(10 * 1000);
				});
	}

	async dispatch(command, message, args, mentions, original)
	{
		await command.action(message, args, mentions, original).catch(console.log); // eslint-disable-line no-unused-expressions, no-console
	}
}
