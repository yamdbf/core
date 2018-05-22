import { Resolver } from '../Resolver';
import { Client } from '../../../client/Client';
import { Command } from '../../Command';
import { Message } from '../../../types/Message';
import { GuildMember, Collection } from 'discord.js';
export declare class MemberResolver extends Resolver {
    constructor(client: Client);
    validate(value: any): Promise<boolean>;
    resolveRaw(value: string, context?: Partial<Message>): Promise<GuildMember | Collection<string, GuildMember> | undefined>;
    resolve(message: Message, command: Command, name: string, value: string): Promise<GuildMember>;
}
