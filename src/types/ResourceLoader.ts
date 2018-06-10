/**
 * @typedef {Function} ResourceLoader Represents a function assigned to
 * a specific language that takes a string key and an optional
 * {@link TemplateData} object and returns a localized string for
 * that language if it exists
 * @deprecated ResourceLoader functions have been replaced with {@link ResourceProxy}
 */

import { TemplateData } from './TemplateData';
export type ResourceLoader = (key: string, data?: TemplateData) => string;
