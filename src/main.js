'use babel';
'use strict';

import 'source-map-support/register';

import Bot from './lib/bot/Bot';
import path from 'path';

let config = require('./config.json');
let pkg = require('../package.json');
let bot = new Bot({ // eslint-disable-line no-unused-vars
	name: 'botframework-rewrite',
	token: config.token,
	selfbot: false,
	version: pkg.version,
	statusText: 'try @mention help',
	commandsDir: path.join(__dirname, 'commands')
}).start();
