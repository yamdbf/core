/**
 * @typedef {Function} ResourceLoader Represents a function assigned to
 * a specific language that takes a string key and a {@link TemplateData}
 * object and returns a localized string for that language if it exists
 */

import { TemplateData } from './TemplateData';
export type ResourceLoader = (key: string, data?: TemplateData) => string;
