import { User } from 'discord.js';
import { Command } from '../../Command';
import { Message } from '../../../types/Message';
import { ResourceProxy } from '../../../types/ResourceProxy';
export default class extends Command {
    constructor();
    action(message: Message, [res, action, user, global]: [ResourceProxy, string, User, string]): Promise<any>;
}
