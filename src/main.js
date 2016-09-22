global.Globals = `${__dirname}\\Globals`;
require(Globals);

// Initialize bot and log in
const bot = new Bot(settings.name, settings.token);
bot.Login();

bot.Say("Starting...");

// Receive console input. If command "restart" is received
// the bot will exit. Assuming the bot is run through run.sh,
// which it should be, it will pull the latest updates from
// the repo and restart the bot
var readline = require("readline");
var rl = readline.createInterface(process.stdin, process.stdout);
rl.on("line", (input) =>
{
	if (input == "restart")
	{
		bot.Say("Restarting...".yellow);
		bot.db.push("/doRestart", true);
		process.exit();
	};
});
