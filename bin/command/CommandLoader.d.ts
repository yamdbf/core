import { Client } from '../client/Client';
/**
 * Handles loading all commands from the given Client's commandsDir
 * @private
 */
export declare class CommandLoader {
    private readonly _logger;
    private readonly _client;
    private readonly _commands;
    constructor(client: Client);
    /**
     * Load commands from the given directory
     * @param {string} dir Directory to load from
     * @param {boolean} [base=false] Whether or not the commands being loaded are base commands
     * @returns {number} The number of Commands loaded from the directory
     */
    loadCommandsFrom(dir: string, base?: boolean): number;
    /**
     * Recursively search for Command classes within the given object
     * @private
     */
    private _findCommandClasses;
}
