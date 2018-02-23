"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Contains static methods for time related calculations and parsing
 * @module Time
 */
class Time {
    /**
     * Return a Difference object representing the time difference between a and b
     * @method difference
     * @param {number} a First time in MS
     * @param {number} b Second time in MS
     * @returns {Difference}
     */
    static difference(a, b) {
        let difference = {};
        let ms = a - b;
        difference.raw = ms;
        let days = Math.floor(ms / 864e5);
        let hours = Math.floor((ms % 864e5) / 36e5);
        let mins = Math.floor(((ms % 864e5) % 36e5) / 6e4);
        let secs = Math.floor((((ms % 864e5) % 36e5) % 6e4) / 1000);
        ms = (((ms % 864e5) % 36e5) % 6e5) % 1000;
        let timeString = '';
        if (days) {
            difference.days = days;
            timeString += `${days} days${hours ? ', ' : ' '}`;
        }
        if (hours) {
            difference.hours = hours;
            timeString += `${hours} hours${mins ? ', ' : ' '}`;
        }
        if (mins) {
            difference.mins = mins;
            timeString += `${mins} mins${secs ? ', ' : ' '}`;
        }
        if (secs) {
            difference.secs = secs;
            timeString += `${secs} secs`;
        }
        difference.ms = ms;
        // Returns the time string as '# days, # hours, # mins, # secs'
        difference.toString = () => timeString.trim() || `${(ms / 1000).toFixed(2)} seconds`;
        // Returns the time string as '#d #h #m #s'
        difference.toSimplifiedString = () => timeString.replace(/ays|ours|ins|ecs| /g, '').replace(/,/g, ' ').trim();
        return difference;
    }
    /**
     * Return a Difference object (for convenience) measuring the
     * duration of the given MS
     * @method duration
     * @param {number} time The time in MS
     * @returns {Difference}
     */
    static duration(time) {
        return this.difference(time * 2, time);
    }
    /**
     * Parse a duration shorthand string and return the duration in ms
     *
     * Shorthand examples: 10m, 5h, 1d
     * @method parseShorthand
     * @param {string} shorthand The shorthand to parse
     * @returns {number}
     */
    static parseShorthand(shorthand) {
        let duration, match;
        if (/^\d+(?:\.\d+)?(?:s(?:ecs?)?|m(?:ins?)?|h(?:rs?|ours?)?|d(?:ays?)?)$/.test(shorthand)) {
            match = shorthand.match(/^(\d+(?:\.\d+)?)(s|m|h|d)/);
            duration = parseFloat(match[1]);
            duration = match[2] === 's'
                ? duration * 1000 : match[2] === 'm'
                ? duration * 1000 * 60 : match[2] === 'h'
                ? duration * 1000 * 60 * 60 : match[2] === 'd'
                ? duration * 1000 * 60 * 60 * 24 : null;
        }
        return duration;
    }
}
exports.Time = Time;

//# sourceMappingURL=Time.js.map
