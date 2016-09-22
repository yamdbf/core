// Pollute the global scope with modules and fields that can be
// used by whatever file loads this file. It's handy, I swear.

// Import all classes //////////////////////////////////////////////////////////

	// load settings.json, package.json
	settings = require("../settings.json");
	pkg      = require("../package.json");

	// Discord Client and bot wrapper
	Client = require("../node_modules/discord.js").Client;
	Bot    = require("./lib/Bot");

	// My lib classes
	ScheduledTask   = require("./lib/ScheduledTask");
	Scheduler       = require("./lib/Scheduler");
	Command         = require("./lib/Command");
	CommandRegistry = require("./lib/CommandRegistry");

	// Tasks

	// Static classes
	Time = require("./lib/Time");

	// Dependency Node Modules
	JsonDB = require("../node_modules/node-json-db");
	colors = require("../node_modules/colors");
	now    = require("../node_modules/performance-now");

	// Native Node Modules
	assert  = require("assert");
	inspect = require("util").inspect;
	fs      = require("fs");
	path    = require("path");


// End class imports ///////////////////////////////////////////////////////////

// Set up color options for console text coloring
colors.setTheme(
{
	say: 'magenta',
	warn: 'yellow',
	error: 'red'
});

// Add method to capitalize every word in a string to String prototype
// Use for capitalizing item names to match warframe.market standards
String.prototype.toTitleCase = function()
{
	return this.replace(/([^\W_]+[^\s-]*) */g, (text) =>
	{
		return text.charAt(0).toUpperCase() + text.substr(1).toLowerCase();
	});
}

// Pad the right side of a string with spaces
// to the desired length
Pad = (text, length) =>
{
	return text + ' '.repeat(length - text.length);
}

// Get filenames in a directory with subdirectories up to 1-deep
// Anything deeper is unecessary anyway.
GetFiles = (dir, list, subdir) =>
{
	var files = fs.readdirSync(dir);
	var list = list || new Array();
	var subdir = subdir || "";
	files.forEach(function(file)
	{
		if (fs.statSync(dir + '/' + file).isDirectory())
		{
			subdir = `${file}/`;
			list = GetFiles(dir + '/' + file, list, subdir);
			subdir = "";
		}
		else
		{
			list.push(subdir + file);
		}
	});
	return list;
};
