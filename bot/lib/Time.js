// Extend the Date class to provide helper methods

/**
 * Extend the Date class to provided helper methods
 * @extends {Date}
 */
class Time extends Date
{
	constructor()
	{
		super()
	}

	/**
	 * Return an object containing the time difference between a and be
	 * @param {int} a Time in milliseconds
	 * @param {int} b Time in milliseconds
	 * @returns {Object} object containing days, hours, mins, secs, and ms
	 *                  Also exposes two methods, toString and
	 *                  toSimplifiedString for the object
	 */
	static Difference(a, b)
	{
		var difference = {}
		var ms = a - b;
		difference.ms = ms;

		// Calculate and separate days, hours, mins, and secs
		var days  = Math.floor(ms / 1000 / 60 / 60 / 24);
		ms -= days * 1000 * 60 * 60 * 24;
		var hours = Math.floor(ms / 1000 / 60 / 60);
		ms -= hours * 1000 * 60 * 60;
		var mins  = Math.floor(ms / 1000 / 60);
		ms -= mins * 1000 * 60;
		var secs  = Math.floor(ms / 1000);

		var timeString = "";
		if (days) { difference.days = days; timeString += days + " days" + ((hours) ? ", " : " "); }
		if (hours) { difference.hours = hours; timeString += hours + " hours" + ((mins) ? ", " : " "); }
		if (mins) { difference.mins = mins; timeString += mins + " mins" + ((secs) ? ", " : " "); }
		if (secs) { difference.secs = secs; timeString += secs + " secs"; }

		// Returns the time string as "# days, # hours, # mins, # secs"
		difference.toString = () => { return timeString; }

		// Returns the time string as "#d #h #m #s"
		difference.toSimplifiedString = () =>
		{
			return timeString
				.replace(/ours|ins|ecs| /g, "")
				.replace(/,/g, " ");
		}

		return difference;
	}
}

module.exports = Time;
