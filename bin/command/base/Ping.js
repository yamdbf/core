"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../Command");
class default_1 extends Command_1.Command {
    constructor() {
        super({
            name: 'ping',
            desc: 'Pong!',
            usage: '<prefix>ping'
        });
    }
    async action(message) {
        let msg = await message.channel.send('Pong!');
        msg.edit(`Pong! (${msg.createdTimestamp - message.createdTimestamp}ms)`);
    }
}
exports.default = default_1;

//# sourceMappingURL=Ping.js.map
