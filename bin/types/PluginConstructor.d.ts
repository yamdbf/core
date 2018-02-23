/**
 * @typedef {Function} PluginConstructor Any class that extends and
 * implements {@link Plugin}. *Not to be confused with an **instance**
 * of a Plugin.*
 */
import { Plugin } from '../client/Plugin';
import { Client } from '../client/Client';
export declare type PluginConstructor = new (client: Client) => Plugin;
