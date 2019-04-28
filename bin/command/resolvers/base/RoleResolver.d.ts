import { Resolver } from '../Resolver';
import { Client } from '../../../client/Client';
import { Command } from '../../Command';
import { Message } from '../../../types/Message';
import { Role, Collection } from 'discord.js';
export declare class RoleResolver extends Resolver {
    constructor(client: Client);
    validate(value: any): Promise<boolean>;
    resolveRaw(value: string, context?: Partial<Message>): Promise<Role | Collection<string, Role> | undefined>;
    resolve(message: Message, command: Command, name: string, value: string): Promise<Role>;
}
