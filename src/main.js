'use babel';
'use strict';

import 'source-map-support/register';

import Bot from './lib/bot/Bot';

let settings = require('../settings.json');
let bot = new Bot({ // eslint-disable-line no-unused-vars
	name: settings.name,
	token: settings.token,
	statusText: settings.status,
	commandsDir: './commands'
}).start();
