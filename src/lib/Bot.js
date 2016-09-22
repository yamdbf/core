require(Globals);

/**
 * Extend the Discord.js Client class to provide a wrapper for the old
 * personality.js functionality and future extensions
 * @extends {Client}
 */
class Bot extends Client
{
	/**
	 * @param {string} name The name of the bot. Will preface Say method output
	 * @param {string} token The login token for the bot
	 * @returns {null}
	 */
	constructor(name, token)
	{
		super();

		this.name = name;
		this.token = token;

		// Initialize a database for the bot
		this.db = new JsonDB("data-store", true, true);

		// Create command registry for the bot
		this.commands = new CommandManager(this);

		// Load commands
		this.LoadCommands();

		// Create an action scheduler for the bot
		this.scheduler = new Scheduler(this);

		// Load tasks
		this.LoadTasks();

		// Schedule tasks

		// Event handlers //////////////////////////////////////////////////////

		// Ready event
		this.on("ready", () =>
		{
			// Send restart success message if coming online from
			// a restart via restart command
			try
			{
				var doRestart = this.db.getData("/doRestart");
				var restartID = this.db.getData("/restartID");
				var restartTime = this.db.getData("/restartTime");
			}
			catch (e)
			{
				this.db.push("/doRestart", false);
				var doRestart = this.db.getData("/doRestart");
				this.db.push("/restartID", undefined);
				var restartID = this.db.getData("/restartID");
				this.db.push("/restartTime", 1);
				var restartTime = this.db.getData("/restartTime");
			}
			if (doRestart)
			{
				this.Say("Restart completed.");
				this.db.push("/doRestart", false);

				// Send restart complete message to channel
				var channel = this.channels.find("id", restartID);
				channel.sendCode("css", `Restart completed. (${(Time.now() - restartTime) / 1000} secs)`)
					.then(message =>
					{
						// Remove the message after 3 seconds
						message.delete(3 * 1000);
					});
			}

			this.user.setStatus(null, settings.status)
				.then(user => this.Say(
					`Status set to: ${user.status}, ${user.game.name}`))
				.catch(this.Say);

			this.Say(`Ready to go! ` +
				`Guilds: ${this.guilds.size.toString().cyan} | ` +
				`Channels: ${this.channels.size.toString().cyan} | ` +
				`Users: ${this.users.size.toString().cyan}`);

			// Set bot reconnectionMessageSuppress time 60 seconds behind
			// to ensure the first reconnection message occurs immediately
			this.reconnectionMessageSuppress = Time.now() - 60000;
		});

		// Reconnecting event
		this.on("reconnecting", () =>
		{
			// Send reconnecting message every 10 seconds during reconnection
			// process until bot successfully reconnects
			if (Time.Difference(Time.now(),
				this.reconnectionMessageSuppress).ms >= 10000)
			{
				this.reconnectionMessageSuppress = Time.now();
				this.Say("Reconnecting...".warn);
			}
		});

		// Disconnected event
		this.on("disconnected", (error, code) =>
		{
			this.Say("Disconnected: ".warn + error);
		});

		// Warn event
		this.on("warn", (w) =>
		{
		    this.Say(w.warn)
		});

		// Error event
		this.on("error", (e) =>
		{
		    this.Say(e.error);
		});
	}

	/**
	 * Load and register all command modules and commands.
	 * Can be called again to reload commands
	 * @param {method} callback callback method to be executed on completion
	 * @returns {null}
	 */
	LoadCommands(callback)
	{
		let start = now();
		let modules = GetDirs("./src/commands");

		// Get currently disabled modules
		try
		{
			var disabledModules = this.db.getData("/disabledModules");
		}
		catch (e)
		{
			this.db.push("/disabledModules", [], true);
			var disabledModules = this.db.getData("/disabledModules");
		}

		glob("./src/commands/**/*.js", (err, filenames) =>
		{
			if (err) throw new Error("Failed to load commands.");

			let cmds = new Array();
			let files = filenames.map(file => file.replace("./src/commands/", ""));

			// No commands to load, break
			if (files.length < 1) return;

			// Remove disabled modules from commands to load
			files = files.filter(filename =>
				disabledModules.filter(dm =>
					filename.includes(dm + "/")).length == 0);

			// Load each command
			files.forEach( (filename, index) =>
			{
				// Load command and push to cmds
				let command = filename.replace(/.js/, "");
				delete require.cache[require.resolve(`../commands/${command}`)];
				cmds[index] = require(`../commands/${command}`);
				this.Say(`Command ${command} loaded.`.green);
			});

			// Register each command
			cmds.forEach( (command, index) =>
			{
				this.commands.Register(new command(), index);
			});

			this.Say(`${modules.length.toString().cyan} module${modules.length > 1 ? "s" : ""}, ` +
				`${cmds.length.toString().cyan} commands loaded and registered! ` +
				`(${(now() - start).toFixed(3).toString().cyan}ms)`);

			if (callback) callback();
		});
	}

	/**
	 * Load and register all ScheduledTask classes. Not meant to be run
	 * more than once as ScheduledTasks will continue to run asynchronously
	 * and reloading tasks will only spawn more instances of the tasks
	 * @param {method} callback callback method to be executed on completion
	 * @returns {null}
	 */
	LoadTasks()
	{
		// Break if tasks have already been loaded
		if (this.tasksLoaded) return;

		let start = now();

		glob("./src/tasks/**/*.js", (err, filenames) =>
		{
			if (err) throw new Error("Failed to load tasks.");

			let tasks = new Array();
			let files = filenames.map(file => file.replace("./src/tasks/", ""));

			// No tasks to load, break
			if (files.length < 1) return;

			// Load each task
			files.forEach( (filename, index) =>
			{
				let task = filename.replace(/.js/, "");
				delete require.cache[require.resolve(`../tasks/${task}`)];
				tasks[index] = require(`../tasks/${task}`);
				this.Say(`Task ${task} loaded.`.green);
			});

			// Schedule each task
			tasks.forEach( (task, index) =>
			{
				this.scheduler.Schedule(new task(), index);
			});

			this.Say(`${this.scheduler.tasks.length.toString().cyan} tasks loaded ` +
				`and registered! (${(now() - start).toFixed(3).toString().cyan}ms)`);
		});

		this.tasksLoaded = true;
	}

	/**
	 * Log the bot into Discord
	 * @returns {null}
	 */
	Login()
	{
		this.login(this.token);
	}

	/**
	 * Write to the console, prefaced by @this.name
	 * @param {string} text The text to write to the console
	 * @returns {null}
	 */
	Say(text)
	{
		if (text)
			console.log(`${"@".say}${this.name.say}: ${text}`);
	}
}

module.exports = Bot;
