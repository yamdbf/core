/**
 * @typedef {Function} PluginConstructor Any class that extends and
 * implements {@link Plugin}. *Not to be confused with an **instance**
 * of a Plugin.*
 */

import { Client } from '../client/Client';
import { Plugin } from '../client/Plugin';

export type PluginConstructor = new (client: Client) => Plugin;
