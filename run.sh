#!/bin/sh
# run.sh

# Pull latest changes from the repo, run the bot
# and loop if the bot closes (most likely for this
# exact purpose; to pull the latest changes)
while true; do
	git pull
	node bot/main --color
done
