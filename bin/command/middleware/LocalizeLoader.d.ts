import { Message } from '../../types/Message';
import { Command } from '../Command';
export declare function localizeLoader<T extends Command>(this: T, message: Message, args: any[]): Promise<[Message, any[]]>;
