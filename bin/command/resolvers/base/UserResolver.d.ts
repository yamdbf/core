import { User, Collection } from 'discord.js';
import { Resolver } from '../Resolver';
import { Client } from '../../../client/Client';
import { Command } from '../../Command';
import { Message } from '../../../types/Message';
export declare class UserResolver extends Resolver {
    constructor(client: Client);
    validate(value: any): Promise<boolean>;
    resolveRaw(value: string, context?: Partial<Message>): Promise<User | Collection<string, User> | undefined>;
    resolve(message: Message, command: Command, name: string, value: string): Promise<User>;
}
