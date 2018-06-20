"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const glob = require("glob");
const path = require("path");
const Logger_1 = require("../util/logger/Logger");
/**
 * Handles loading all commands from the given Client's commandsDir
 * @private
 */
class CommandLoader {
    constructor(client) {
        this._client = client;
        this._commands = client.commands;
    }
    /**
     * Load commands from the given directory
     * @param {string} dir Directory to load from
     * @param {boolean} [base=false] Whether or not the commands being loaded are base commands
     * @returns {number} The number of Commands loaded from the directory
     */
    loadCommandsFrom(dir, base = false) {
        dir = path.resolve(dir);
        let commandFiles = glob.sync(`${dir}/**/*.js`);
        if (this._client.tsNode) {
            commandFiles.push(...glob.sync(`${dir}/**/!(*.d).ts`));
            const filteredCommandFiles = commandFiles.filter(f => {
                const file = f.match('/([^\/]+?)\.[j|t]s$')[1];
                if (f.endsWith('.ts'))
                    return true;
                if (f.endsWith('.js'))
                    return !commandFiles.find(cf => cf.endsWith(`${file}.ts`));
            });
            commandFiles = filteredCommandFiles;
        }
        const loadedCommands = [];
        this._logger.debug(`Loading commands in: ${dir}`);
        for (const file of commandFiles) {
            delete require.cache[require.resolve(file)];
            const loadedFile = require(file);
            const commandClass = this._findCommandClass(loadedFile);
            if (!commandClass) {
                this._logger.debug(`Failed to find Command class in file: ${file}`);
                continue;
            }
            const commandInstance = new commandClass();
            if (base && this._client.disableBase
                .includes(commandInstance.name))
                continue;
            this._logger.info(`Loaded command: ${commandInstance.name}`);
            commandInstance._classloc = file;
            loadedCommands.push(commandInstance);
        }
        for (const command of loadedCommands)
            this._commands._registerInternal(command);
        return loadedCommands.length;
    }
    /**
     * Recursively search for a Command class within the given object
     * @private
     */
    _findCommandClass(obj) {
        let foundClass;
        const keys = Object.keys(obj);
        if (Object.getPrototypeOf(obj).name === 'Command')
            foundClass = obj;
        else if (keys.length > 0)
            for (const key of keys) {
                foundClass = this._findCommandClass(obj[key]);
                if (!foundClass)
                    continue;
                if (Object.getPrototypeOf(foundClass).name === 'Command')
                    break;
            }
        return foundClass;
    }
}
__decorate([
    Logger_1.logger('CommandLoader')
], CommandLoader.prototype, "_logger", void 0);
exports.CommandLoader = CommandLoader;

//# sourceMappingURL=CommandLoader.js.map
