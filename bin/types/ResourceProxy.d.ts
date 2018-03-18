/**
 * @typedef {object} ResourceProxy A Proxy where calling functions will treat the
 * function name as a Lang string key and act as a ResourceLoader, requiring only
 * the strings TemplateData (or nothing for non-dynamic strings)
 *
 * >TypeScript users can pass a generic type parameter to the ResourceProxy type
 * which will append all the keys of the passed type to the valid keys on the
 * ResourceProxy itself. This makes it easier to get type hinting for custom
 * localization strings. Example:
 * ```
 * type C = {
 *     FOO: any;
 *     BAR: any;
 * };
 * ...
 * let r: ResourceProxy<C> = Lang.createResourceProxy('en_us');
 * return r.FOO(); // `FOO` will be of type `(data?: TemplateData) => string`
 *                 // so this returns a string
 * ```
 */
import { TemplateData } from '../types/TemplateData';
import { BaseStrings } from '..';
export declare type ResourceProxy<T = {}> = {
    [key in BaseStrings]: (data?: TemplateData) => string;
} & {
    [key in keyof T]: (data?: TemplateData) => string;
};
