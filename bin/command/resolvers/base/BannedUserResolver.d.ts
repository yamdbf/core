import { Resolver } from '../Resolver';
import { Client } from '../../../client/Client';
import { Command } from '../../Command';
import { Message } from '../../../types/Message';
import { User, Collection } from 'discord.js';
export declare class BannedUserResolver extends Resolver {
    constructor(client: Client);
    validate(value: any): boolean;
    resolveRaw(value: string, context?: Partial<Message>): Promise<User | Collection<string, User> | undefined>;
    resolve(message: Message, command: Command, name: string, value: string): Promise<User>;
}
