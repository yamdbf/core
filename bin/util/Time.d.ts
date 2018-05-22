import { Difference } from '../types/Difference';
/**
 * Contains static methods for time related calculations and parsing
 * @module Time
 */
export declare class Time {
    /**
     * Return a Difference object representing the time difference between a and b
     * @method difference
     * @param {number} a First time in MS
     * @param {number} b Second time in MS
     * @returns {Difference}
     */
    static difference(a: number, b: number): Difference;
    /**
     * Return a Difference object (for convenience) measuring the
     * duration of the given MS
     * @method duration
     * @param {number} time The time in MS
     * @returns {Difference}
     */
    static duration(time: number): Difference;
    /**
     * Parse a duration shorthand string and return the duration in ms
     *
     * Shorthand examples: 10m, 5h, 1d
     * @method parseShorthand
     * @param {string} shorthand The shorthand to parse
     * @returns {number}
     */
    static parseShorthand(shorthand: string): number | null;
}
