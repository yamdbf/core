'use babel';
'use strict';

/**
 * Handles dispatching commands
 * @class CommandDispatcher
 * @param {Bot} bot - Bot instance
 */
export default class CommandDispatcher
{
	constructor(bot)
	{
		/** @type {Bot} */
		this._bot = bot;

		// Register message listener
		if (!this._bot.passive)
		{
			this._bot.on('message', message =>
			{
				this.handleMessage(message);
			});
		}
	}

	/**
	 * Determine if message is a valid command call and send to {@link CommandDispatcher#dispatch}
	 * @memberof CommandDispatcher
	 * @instance
	 * @param {external:Message} message - Discord.js message object
	 * @returns {*}
	 */
	handleMessage(message)
	{
		let config = this._bot.config;
		if (this._bot.selfbot && message.author !== this._bot.user) return false;
		if (message.author.bot) return false;
		let original = message.content;

		let { command, mentions, args, content, dm } = this.processContent(message);
		message.content = content;

		if (dm && !command && !this._bot.selfbot)
		{
			return this.commandNotFoundError(message);
		}
		else if (!command)
		{
			message.content = original;
			return false;
		}

		let guildStorage = !dm ? this._bot.guildStorages.get(message.guild) : null;
		if (!dm && guildStorage.settingExists('disabledGroups')
			&& guildStorage.getSetting('disabledGroups').includes(command.group)) return false;
		if (command.ownerOnly && !config.owner.includes(message.author.id)) return false;
		if (dm && command.guildOnly) return this.guildOnlyError(message);

		let missingPermissions = this.checkPermissions(dm, message, command);
		if (missingPermissions.length > 0) return this.missingPermissionsError(missingPermissions, message);

		if (!this.hasRoles(dm, message, command)) return this.missingRolesError(message, command);

		return this.dispatch(command, message, args, mentions, original);
	}

	/**
	 * Processes message content, finding the command to execute and creating an
	 * object containing the found command, mentions, args, processed content, and
	 * if the message is a DM
	 * @memberof CommandDispatcher
	 * @instance
	 * @param {external:Message} message - Discord.js message object
	 * @returns {Object}
	 */
	processContent(message)
	{
		let dm = message.channel.type === 'dm' || message.channel.type === 'group';
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

		let botMention = /^<@!?\d+>.+/.test(message.content)
			&& mentions[0].id === this._bot.user.id
			&& !this._bot.selfbot;

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
		else if (!dm && (message.content.startsWith(this._bot.getPrefix(message.guild))
			|| !this._bot.getPrefix(message.guild)))
		{
			content = message.content.slice(this._bot.getPrefix(message.guild)
				? this._bot.getPrefix(message.guild).length : 0).replace(/<@!?\d+>/g, '').trim();
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
		let command = this._bot.commands.findByNameOrAlias(commandName);

		let args = content.split(command ? command.argOpts.separator : ' ').slice(1)
			.map(a => !isNaN(a) && command && !command.argOpts.stringArgs ? parseFloat(a) : a)
			.map(a => typeof a === 'string' ? a.trim() : a);

		return { command: command, mentions: mentions, args: args, content: content, dm: dm };
	}

	/**
	 * Get a list of missing permissions for the command caller for the
	 * given command, if any
	 * @memberof CommandDispatcher
	 * @instance
	 * @param {boolean} dm - Whether the message is a DM
	 * @param {external:Message} message - Discord.js message object
	 * @param {Command} command - Command found by the dispatcher
	 * @returns {external:PermissionResolvable[]}
	 */
	checkPermissions(dm, message, command)
	{
		return this._bot.selfbot || dm ? [] : command.permissions.filter(a =>
			!message.channel.permissionsFor(message.author).hasPermission(a));
	}

	/**
	 * Checks if the command caller has roles for the given command
	 * @memberof CommandDispatcher
	 * @instance
	 * @param {boolean} dm - Whether the message is a DM
	 * @param {external:Message} message - Discord.js message object
	 * @param {Command} command - Command found by the dispatcher
	 * @returns {boolean}
	 */
	hasRoles(dm, message, command)
	{
		return this._bot.selfbot || command.roles.length === 0 || dm
			|| message.member.roles.filter(role =>
				command.roles.includes(role.name)).size > 0;
	}

	/**
	 * Send a 'command not found' error message to the channel
	 * @memberof CommandDispatcher
	 * @instance
	 * @param {external:Message} message - Discord.js message object
	 * @returns {Promise<external:Message>}
	 */
	commandNotFoundError(message)
	{
		return message.channel.sendMessage(``
			+ `Sorry, I didn't recognize any command in your message.\n`
			+ `Try saying "help" to view a list of commands you can use in `
			+ `this DM, or try calling the\nhelp command in a server channel `
			+ `to see what commands you can use there!`);
	}

	/**
	 * Send a 'guild only' error message to the channel
	 * @memberof CommandDispatcher
	 * @instance
	 * @param {external:Message} message - Discord.js message object
	 * @returns {Promise<external:Message>}
	 */
	guildOnlyError(message)
	{
		return message.channel.sendMessage(``
			+ `That command is for servers only. Try saying "help" to see a `
			+ `list of commands you can use in this DM`);
	}

	/**
	 * Send a 'missing permissions' error message to the channel
	 * @memberof CommandDispatcher
	 * @instance
	 * @param {external:PermissionResolvable[]} missing - Array of missing permissions
	 * @param {external:Message} message - Discord.js message object
	 * @returns {Promise<external:Message>}
	 */
	missingPermissionsError(missing, message)
	{
		return message[`${this._bot.selfbot ? 'channel' : 'author'}`].sendMessage(``
			+ `**You're missing the following permission`
			+ `${missing.length > 1 ? 's' : ''} `
			+ `for that command:**\n\`\`\`css\n`
			+ `${missing.join(', ')}\n\`\`\``)
				.then(response =>
				{
					if (this._bot.selfbot) response.delete(10 * 1000);
				});
	}

	/**
	 * Send a 'missing roles' error message to the channel
	 * @memberof CommandDispatcher
	 * @instance
	 * @param {external:Message} message - Discord.js message object
	 * @param {Command} command - Command found by the dispatcher
	 * @returns {Promise<external:Message>}
	 */
	missingRolesError(message, command)
	{
		return message[`${this._bot.selfbot ? 'channel' : 'author'}`].sendMessage(``
			+ `**You must have ${command.roles.length > 1
				? 'one of the following roles' : 'the following role'}`
			+ ` to use that command:**\n\`\`\`css\n`
			+ `${command.roles.join(', ')}\n\`\`\``)
				.then(response =>
				{
					if (this._bot.selfbot) response.delete(10 * 1000);
				});
	}

	/**
	 * Pass the necessary items to the found Command's {@link Command#action} method
	 * @memberof CommandDispatcher
	 * @instance
	 * @param {Command} command - The command found by the dispatcher
	 * @param {external:Message} message - Discord.js message object
	 * @param {args[]} args - An array containing the args parsed from the command calling message
	 * @param {external:User[]} mentions - An array containing the Discord.js User
	 * objects parsed from the mentions contained in a message
	 * @param {string} original - The original raw content of the message that called the command
	 */
	async dispatch(command, message, args, mentions, original)
	{
		try
		{
			command.action(message, args, mentions, original);

			/**
			 * Emitted whenever a command is successfully called
			 * @memberof Bot
			 * @instance
			 * @event event:command
			 * @param {string} name - name of the called command
			 * @param {args[]} args - args passed to the called command
			 * @param {string} original - original content of the message that called the command
			 */
			this._bot.emit('command', command.name, args, original);
		}
		catch (err)
		{
			console.log(err); // eslint-disable-line no-console
		}
	}
}
