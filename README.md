# botlib-base
A Discord.js-based Discord Bot library to be used as a base for quick bot development.


This repo contains a fully-functioning Discord Bot to use as a base for new bots. 


# Getting started
Rename settings.json.example to settings.json and fill in the settings fields. By default the command prefix is '/'. This can be changed directly in settings.json when the bot is not running or by using the admin-only setprefix command when the bot is running. The admin field is to be an array of user ids that the bot will allow to execute commands with the admin property set to true.


Admin-only commands are not listed in the help command texts, however they can still be called by name with the help command to see their help text. These admin-only commands utilize the settings.admin property in settings.json and are meant to be commands to be used by bot operators; people with access to the file structure and code of the bot. If you want a command to be usable by only server admins, rather than the settings.admin property you should use the Command#permissions array property and add the "ADMINISTRATOR" permission for the command.


# Running the bot
Once settings.json is all set up the bot can be run using run.sh. It would be trivial to write a batch script to do the same thing as run.sh if Windows cmd is your only option. run.sh will run "git pull && node src/main" on loop. Whenever the bot exits for whatever reason, most likely due to the restart command, the bot will attempt to pull updates and restart itself. CTRL+C can be used as normal to exit the script.


# Adding commands
Adding commands is as simple as copying the command.example.js file in the examples folder, writing regex for command recognition, writing an action to be executed when the command is called, and putting the new command file in the commands folder. Filling in the helptext fields will automatically populate the help command with information about the command. The command will be loaded when the bot starts as long as it is in the commands folder. If the bot is already running the reload command can be used to load the newly-added command.

Commands utilize regex for chat command recognition and parsing but the regex is not meant to incorporate a command prefix. The command prefix is to be configured in settings.json. The botlib base contains the command "setprefix" that allows a bot owner to set the command prefix from within discord
