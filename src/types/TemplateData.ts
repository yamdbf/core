/**
 * @typedef {object} TemplateData Represents an object mapping template
 * keys to string values, where the template keys will be replaced with
 * the provided values in the source string when given to a Lang resource
 * function like {@link Lang.res}
 */

export type TemplateData = { [key: string]: string };
