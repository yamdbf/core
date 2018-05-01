"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Helper singleton for attaching single-use, expiring reaction buttons to
 * Messages, to be used by the Client when compact mode is active
 */
class CompactModeHelper {
    constructor(client) {
        if (CompactModeHelper._instance)
            throw new Error('Cannot create multiple instances of CompactModeHelper');
        this._client = client;
        this._buttons = {};
        // Handle button clicks
        this._client.on('messageReactionAdd', (reaction, user) => {
            const emojiIdentifier = reaction.emoji.id || reaction.emoji.name;
            const buttonIdentifier = `${reaction.message.id}:${emojiIdentifier}`;
            if (!(buttonIdentifier in this._buttons))
                return;
            if (user.id !== reaction.message.author.id)
                return;
            const button = this._buttons[buttonIdentifier];
            if (button.consumed || button.expires < Date.now())
                return;
            button.consumed = true;
            button.action();
        });
        // Clean up expired/consumed buttons
        this._client.setInterval(() => {
            for (const identifier in this._buttons) {
                const button = this._buttons[identifier];
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
    static createInstance(client) {
        CompactModeHelper._instance = new CompactModeHelper(client);
    }
    /**
     * Register a single-use reaction button on a Message that will
     * execute the given action when clicked by the Message author.
     *
     * Buttons remain clickable for 30 seconds, or until consumed
     * via click by the Message author
     * @param {Message} message Message to register a button for
     * @param {string} emoji A unicode emoji, or a custom emoji ID
     * @param {Function} action Function to execute when the reaction button is clicked
     * @returns {Promise<void>}
     */
    static async registerButton(message, emoji, action) {
        if (!CompactModeHelper._instance)
            throw new Error('CompactModeHelper instance has not been created');
        if (typeof emoji !== 'string')
            throw new TypeError('Emoji must be a unicode string or emoji snowflake');
        await message.react(emoji);
        CompactModeHelper._instance._buttons[`${message.id}:${emoji}`] =
            { expires: Date.now() + 30e3, consumed: false, emoji, action };
    }
}
exports.CompactModeHelper = CompactModeHelper;

//# sourceMappingURL=CompactModeHelper.js.map
