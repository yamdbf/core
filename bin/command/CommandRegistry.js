"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const Logger_1 = require("../util/logger/Logger");
/**
 * @classdesc Stores loaded Commands in a Collection keyed by each Command's `name` property
 * @class CommandRegistry
 * @extends {external:Collection}
 */
class CommandRegistry extends discord_js_1.Collection {
    constructor(client) {
        super();
        Object.defineProperty(this, '_client', { value: client });
        Object.defineProperty(this, '_reserved', {
            value: [
                () => this.has('limit') ? 'clear' : null
            ]
        });
    }
    static get [Symbol.species]() {
        return discord_js_1.Collection;
    }
    /**
     * Contains all [Command groups]{@link Command#group}
     * @readonly
     * @type {string[]}
     */
    get groups() {
        return Array.from(new Set(this.map(c => c.group)));
    }
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
    registerExternal(command) {
        this._logger.info(`External command loaded: ${command.name}`);
        this._registerInternal(command, true);
    }
    /**
     * Resolve the given Command name or alias to a registered Command
     * @param {string} input Command name or alias
     * @returns {Command | undefined}
     */
    resolve(input) {
        input = input ? input.toLowerCase() : input;
        return this.find(c => c.name.toLowerCase() === input
            || !!c.aliases.find(a => a.toLowerCase() === input));
    }
    /**
     * Complete registration of a command and add to the parent collection.
     *
     * This is an internal method and should not be used. Use
     * `registerExternal()` instead
     * @private
     */
    _registerInternal(command, external = false) {
        if (this.has(command.name)) {
            if (!this.get(command.name).external)
                this._logger.info(`Replacing previously loaded command: ${command.name}`);
            else
                this._logger.info(`Replacing externally loaded command: ${command.name}`);
            this.delete(command.name);
        }
        this.set(command.name, command);
        command._register(this._client);
        if (external)
            command.external = true;
    }
    /**
     * Check for duplicate aliases, erroring on any. Used internally
     * @private
     */
    _checkDuplicateAliases() {
        for (const command of this.values())
            for (const alias of command.aliases) {
                const duplicate = this.filter(c => c !== command).find(c => c.aliases.includes(alias));
                const name = command.name;
                if (!duplicate)
                    continue;
                if (!command.external)
                    throw new Error(`Commands may not share aliases: ${name}, ${duplicate.name} (shared alias: "${alias}")`);
                else
                    throw new Error([
                        `External command "${duplicate.name}" has conflicting alias`,
                        `with "${name}" (shared alias: "${alias}")`
                    ].join(' '));
            }
    }
    /**
     * Check for commands with reserved names. Used internally
     * @private
     */
    _checkReservedCommandNames() {
        const reserved = this._reserved.map(r => typeof r !== 'string' ? r() : r);
        for (const name of reserved) {
            if (!name)
                continue;
            const command = this.resolve(name);
            if (command)
                throw new Error(`Command '${command.name}' is using reserved name or alias: '${name}'`);
        }
    }
    /**
     * Run the `init()` method of all loaded commands.
     * This is an internal method and should not be used
     * @private
     */
    async _initCommands() {
        let success = true;
        for (const command of this.values()) {
            if (command._initialized)
                continue;
            try {
                await command.init();
                command._initialized = true;
            }
            catch (err) {
                success = false;
                this._logger.error(`Command "${command.name}" errored during initialization: \n\n${err.stack}`, command.external ? '\n\nPlease report this error to the command author.\n' : '\n');
            }
        }
        return success;
    }
}
__decorate([
    Logger_1.logger('CommandRegistry')
], CommandRegistry.prototype, "_logger", void 0);
exports.CommandRegistry = CommandRegistry;

//# sourceMappingURL=CommandRegistry.js.map
