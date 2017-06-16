/**
 * @typedef {Function} LangResourceFunction Represents a function assigned to
 * a specific language that takes a string key and a {@link TokenReplaceData}
 * object and returns a localized string for that language if it exists
 */

import { TokenReplaceData } from './TokenReplaceData';
export type LangResourceFunction = (key: string, data?: TokenReplaceData) => string;
