import { Client } from '../client/Client';
import { Command } from './Command';
import { Collection } from 'discord.js';
/**
 * @classdesc Stores loaded Commands in a Collection keyed by each Command's `name` property
 * @class CommandRegistry
 * @extends {external:Collection}
 */
export declare class CommandRegistry<T extends Client, K extends string = string, V extends Command<T> = Command<T>> extends Collection<K, V> {
    private readonly _logger;
    private readonly _client;
    private readonly _reserved;
    constructor(client: T);
    static readonly [Symbol.species]: typeof Collection;
    /**
     * Contains all [Command groups]{@link Command#group}
     * @readonly
     * @type {string[]}
     */
    readonly groups: string[];
    /**
     * Register an external command and add it to the `<Client>.commands`
     * [collection]{@link external:Collection}, erroring on duplicate
     * aliases
     *
     * >**Note:** This is intended for Plugins to use to register external
     * commands with the Client instance. Under normal circumstances
     * commands should be added by placing them in the directory passed
     * to the `commandsDir` YAMDBF Client option
     * @param {Command} command The Command instance to be registered
     * @returns {void}
     */
    registerExternal(command: Command<any>): void;
    /**
     * Resolve the given Command name or alias to a registered Command
     * @param {string} input Command name or alias
     * @returns {Command | undefined}
     */
    resolve(input: string): V | undefined;
    /**
     * Complete registration of a command and add to the parent collection.
     *
     * This is an internal method and should not be used. Use
     * `registerExternal()` instead
     * @private
     */
    _registerInternal(command: V, external?: boolean): void;
    /**
     * Check for duplicate aliases, erroring on any. Used internally
     * @private
     */
    _checkDuplicateAliases(): void;
    /**
     * Check for commands with reserved names. Used internally
     * @private
     */
    _checkReservedCommandNames(): void;
    /**
     * Run the `init()` method of all loaded commands.
     * This is an internal method and should not be used
     * @private
     */
    _initCommands(): Promise<boolean>;
}
