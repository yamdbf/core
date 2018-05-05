/**
 * @typedef {object} RespondOptions Object consisting of {@link external:MessageOptions} and
 * an optional `button` string field for compact mode support
 * @property {string} [button] Unicode emoji string, custom enoji ID, or a key from the
 * 							   Client's `buttons` map
 */
import { MessageOptions } from 'discord.js';
export declare type RespondOptions = MessageOptions & {
    button?: string;
};
