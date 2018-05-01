import { Client } from '../client/Client';
import { Message } from 'discord.js';
/**
 * Helper singleton for attaching single-use, expiring reaction buttons to
 * Messages, to be used by the Client when compact mode is active
 */
export declare class CompactModeHelper {
    private static _instance;
    private readonly _client;
    private readonly _buttons;
    private constructor();
    /**
     * Create the CompactModeHelper singleton instance
     * >**Note:** This is called automatically by the Client.
     * You do not need to create your own instance
     * @param {Client} client YAMDBF Client instance
     * @returns {void}
     */
    static createInstance(client: Client): void;
    /**
     * Register a single-use reaction button on a Message that will
     * execute the given action when clicked by the Message author.
     *
     * Buttons remain clickable for 30 seconds, or until consumed
     * via click by the Message author
     * @param {Message} message Message to register a button for
     * @param {string} emoji A unicode emoji, or a custom emoji ID
     * @param {Function} action Function to execute when the reaction button is cliecked
     * @returns {Promise<void>}
     */
    static registerButton(message: Message, emoji: string, action: Function): Promise<void>;
}
