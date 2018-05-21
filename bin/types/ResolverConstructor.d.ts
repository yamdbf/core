/**
 * @typedef {Function} ResolverConstructor Any class that extends and
 * implements {@link Resolver}. *Not to be confused with an **instance**
 * of a Resolver.*
 */
import { Resolver } from '../command/resolvers/Resolver';
import { Client } from '../client/Client';
export declare type ResolverConstructor = new (client: Client) => Resolver;
