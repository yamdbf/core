/**
 * @typedef {object} TokenReplaceData Represents an object mapping key
 * tokens to string values, where the token keys will be replaced with
 * the provided value in the source string when given to a Lang resource
 * function like {@link Lang.res}
 */

export type TokenReplaceData = { [key: string]: string };
