import { Client } from '../client/Client';
import { Message, GuildMember, User } from 'discord.js';

type SingleUseButton = { expires: number, consumed: boolean, emoji: string, action: Function };

/**
 * Helper singleton for attaching single-use, expiring reaction buttons to
 * Messages, to be used by the Client when compact mode is active
 */
export class CompactModeHelper
{
	private static _instance: CompactModeHelper;

	private readonly _client: Client;
	private readonly _buttons: { [identifier: string]: SingleUseButton };

	private constructor(client: Client)
	{
		if (CompactModeHelper._instance)
			throw new Error('Cannot create multiple instances of CompactModeHelper');

		this._client = client;
		this._buttons = {};

		// Handle button clicks
		this._client.on('messageReactionAdd', (reaction, user) => {
			const emojiIdentifier: string = reaction.emoji.id || reaction.emoji.name;
			const buttonIdentifier: string = `${reaction.message.id}:${emojiIdentifier}`;

			if (!(buttonIdentifier in this._buttons)) return;
			if (user.id !== reaction.message.author.id) return;

			const button: SingleUseButton = this._buttons[buttonIdentifier];

			if (button.consumed || button.expires < Date.now()) return;

			button.consumed = true;
			button.action();
		});

		// Clean up expired/consumed buttons
		this._client.setInterval(() => {
			for (const identifier in this._buttons)
			{
				const button: SingleUseButton = this._buttons[identifier];
				if (button.consumed || button.expires < Date.now())
					delete this._buttons[identifier];
			}
		}, 30e3);
	}

	/**
	 * Create the CompactModeHelper singleton instance
	 * >**Note:** This is called automatically by the Client.
	 * You do not need to create your own instance
	 * @param {Client} client YAMDBF Client instance
	 * @returns {void}
	 */
	public static createInstance(client: Client): void
	{
		CompactModeHelper._instance = new CompactModeHelper(client);
	}

	/**
	 * Register a single-use reaction button on a Message that will
	 * execute the given action when clicked by the Message author.
	 *
	 * Buttons remain clickable for the given lifespan (30 seconds by
	 * default), or until consumed via click by the Message author
	 *
	 * >If the Client doesn't have permissions to add reactions the
	 * given action function will be invoked immediately
	 * @param {Message} message Message to register a button for
	 * @param {string} emoji A unicode emoji, custom emoji ID, or a button
	 * 						 key from {@link Client#buttons}
	 * @param {Function} action Function to execute when the reaction button is clicked
	 * @param {number} [lifespan=30000] Lifespan of the button in MS
	 * @returns {Promise<void>}
	 */
	public static async registerButton(message: Message, emoji: string, action: Function, lifespan: number = 30e3): Promise<void>
	{
		if (!CompactModeHelper._instance)
			throw new Error('CompactModeHelper instance has not been created');

		if (typeof emoji !== 'string')
			throw new TypeError('Emoji must be a unicode emoji, custom emoji id, or client button key');

		if (CompactModeHelper._instance._client.buttons[emoji])
			emoji = CompactModeHelper._instance._client.buttons[emoji];

		let clientMember!: GuildMember;
		let invokeImmediately: boolean = false;

		if (message.channel.type === 'text')
		{
			try
			{
				const clientUser: User = CompactModeHelper._instance._client.user!;
				clientMember = message.guild.members.get(clientUser.id) || await message.guild.members.fetch(clientUser);
			}
			catch { invokeImmediately = true; }
		}

		if (clientMember && !clientMember.permissionsIn(message.channel).has('ADD_REACTIONS'))
			invokeImmediately = true;

		if (!invokeImmediately)
		{
			await message.react(emoji);
			CompactModeHelper._instance._buttons[`${message.id}:${emoji}`] =
				{ expires: Date.now() + lifespan, consumed: false, emoji, action };
		}
		else action();
	}
}
