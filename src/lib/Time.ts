import { Difference } from './types/Difference';

/**
 * Extend the Date class to provide helper methods
 */
export class Time extends Date
{
	public constructor() { super(); }

	/**
	 * Return a Difference object representing the time difference between a and b
	 */
	public static difference(a: number, b: number): Difference
	{
		let difference: Difference = {};
		let ms: number = a - b;
		difference.ms = ms;

		let days: number = Math.floor(ms / 1000 / 60 / 60 / 24);
		ms -= days * 1000 * 60 * 60 * 24;
		let hours: number = Math.floor(ms / 1000 / 60 / 60);
		ms -= hours * 1000 * 60 * 60;
		let mins: number = Math.floor(ms / 1000 / 60);
		ms -= mins * 1000 * 60;
		let secs: number = Math.floor(ms / 1000);

		let timeString: string = '';
		if (days) { difference.days = days; timeString += `${days} days${hours ? ', ' : ' '}`; }
		if (hours) { difference.hours = hours; timeString += `${hours} hours${mins ? ', ' : ' '}`; }
		if (mins) { difference.mins = mins; timeString += `${mins} mins${secs ? ', ' : ' '}`; }
		if (secs) { difference.secs = secs; timeString += `${secs} secs`; }

		// Returns the time string as '# days, # hours, # mins, # secs'
		difference.toString = () => timeString.trim() || `${(ms / 1000).toFixed(2)} seconds`;

		// Returns the time string as '#d #h #m #s'
		difference.toSimplifiedString = () =>
			timeString.replace(/ays|ours|ins|ecs| /g, '').replace(/,/g, ' ').trim();

		return difference;
	}

	/**
	 * Return a Difference object (for convenience) measuring the
	 * duration of the given MS
	 */
	public static duration(time: number): Difference
	{
		return this.difference(time * 2, time);
	}

	/**
	 * Parse a duration shorthand string and return the duration in ms
	 *
	 * Shorthand examples: 10m, 5h, 1d
	 */
	public static parseShorthand(shorthand: string): number
	{
		let duration: number, match: RegExpMatchArray;
		if (/^(?:\d+(?:\.\d+)?)[s|m|h|d]$/.test(<string> shorthand))
		{
			match = shorthand.match(/(\d+(?:\.\d+)?)(s|m|h|d)$/);
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
