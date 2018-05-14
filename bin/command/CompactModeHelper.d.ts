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
    static registerButton(message: Message, emoji: string, action: Function, lifespan?: number): Promise<void>;
}
