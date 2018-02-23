import { Message } from '../../../types/Message';
import { Command } from '../../Command';
import { User } from 'discord.js';
import { ResourceLoader } from '../../../types/ResourceLoader';
export default class  extends Command {
    constructor();
    action(message: Message, [res, action, user, global]: [ResourceLoader, string, User, string]): Promise<Message | Message[]>;
}
