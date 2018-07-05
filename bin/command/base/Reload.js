"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../Command");
const CommandDecorators_1 = require("../CommandDecorators");
const Middleware_1 = require("../middleware/Middleware");
const Util_1 = require("../../util/Util");
const Logger_1 = require("../../util/logger/Logger");
class default_1 extends Command_1.Command {
    constructor() {
        super({
            name: 'reload',
            desc: 'Reload all custom commands',
            usage: '<prefix>reload',
            ownerOnly: true
        });
    }
    action(message, [res]) {
        this._logger.log(`Reloading commands from: $${this.client.commandsDir}`);
        const start = Util_1.Util.now();
        const disabled = this.client.commands.filter(c => c.disabled).map(c => c.name);
        const reloaded = this.client._reloadCustomCommands();
        this._logger.log(`Re-initializing reloaded commands...`);
        this.client.commands._initCommands();
        const toDisable = this.client.commands.filter(c => disabled.includes(c.name));
        // Re-disable previously disabled commands
        for (const command of toDisable.values())
            command.disable();
        const end = Util_1.Util.now();
        const num = reloaded.toString();
        const time = (end - start).toFixed(3);
        return this.respond(message, res.CMD_RELOAD_SUCCESS({ number: num, time }));
    }
}
__decorate([
    Logger_1.logger('Command:reload')
], default_1.prototype, "_logger", void 0);
__decorate([
    CommandDecorators_1.using(Middleware_1.Middleware.localize)
], default_1.prototype, "action", null);
exports.default = default_1;

//# sourceMappingURL=Reload.js.map
