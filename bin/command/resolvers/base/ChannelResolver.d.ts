import { Resolver } from '../Resolver';
import { Client } from '../../../client/Client';
import { Command } from '../../Command';
import { Message } from '../../../types/Message';
import { TextChannel, Collection } from 'discord.js';
export declare class ChannelResolver extends Resolver {
    constructor(client: Client);
    validate(value: any): boolean;
    resolveRaw(value: string, context?: Partial<Message>): Promise<TextChannel | Collection<string, TextChannel> | undefined>;
    resolve(message: Message, command: Command, name: string, value: string): Promise<TextChannel>;
}
