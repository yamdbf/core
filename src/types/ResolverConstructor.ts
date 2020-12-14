/**
 * @typedef {Function} ResolverConstructor Any class that extends and
 * implements {@link Resolver}. *Not to be confused with an **instance**
 * of a Resolver.*
 */

import { Client } from '../client/Client';
import { Resolver } from '../command/resolvers/Resolver';

export type ResolverConstructor = new (client: Client) => Resolver;
