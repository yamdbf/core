## YAMDBF: Yet Another Modular Discord Bot Framework

[![Discord](https://discordapp.com/api/guilds/233751981838041090/embed.png)](https://discord.gg/cMXkbXV)
[![npm](https://img.shields.io/npm/v/yamdbf.svg?maxAge=3600)](https://www.npmjs.com/package/yamdbf)
[![David](https://david-dm.org/zajrik/yamdbf/status.svg)](https://david-dm.org/zajrik/yamdbf)
[![David](https://david-dm.org/zajrik/yamdbf/peer-status.svg)](https://david-dm.org/zajrik/yamdbf?type=peer)
[![Travis](https://api.travis-ci.org/zajrik/yamdbf.svg)](https://travis-ci.org/zajrik/yamdbf)

[![NPM](https://nodei.co/npm/yamdbf.png?downloads=true&stars=true)](https://nodei.co/npm/yamdbf/)

YAMDBF is a lightweight Discord Bot framework for rapid bot development using [Discord.js](https://discord.js.org),
making it simple to get a bot up and running with minimal effort and configuration.

>Note: Features described here are representative of the state of the master branch. Installing directly from GitHub
is currently preferred due to the proximity to release and dependency issues in the latest stable release.

>Use `npm install --save zajrik/yamdbf` to install from GitHub. This requires `git` to be installed and in your PATH,
and also requires > Node 8.0.0 to run.

>Documentation for the master branch can be found [here](https://yamdbf.js.org/indev).

## Features
- Fully localizable (English by default)
- Base commands for control over default settings
- Full control over all base commands via disabling or overloading
- Simple structure for creation of custom commands
- Automatic custom command loading
- Fine control of command execution per-user/globally via configurable ratelimits
- Robust middleware system for fine control of execution flow and  
  control over the data passed to your commands
  - Ships with methods for resolving different data types and ensuring  
    certain args/types are passed to commands
- Easy to use storage with support for custom storage providers
  - Ships with a default JSON provider, and other optional providers using Sequelize:
    - Postgres
	- SQLite
- Full TypeScript support (It's written in it!)
  - Support for decorators for simpler handling of:
	- Event listeners
    - Command metadata
	- Command middleware assignment
	- Attaching Logger for logging/debugging

## Installation
Ignore any warnings about unmet peer dependencies as they are all optional unless using a Sequelize-based storage provider.

Regular install: `npm install --save yamdbf`   
With a Postgres provider: `npm install --save yamdbf pg sequelize`   
With an SQLite provider: `npm install --save yamdbf sqlite3 sequelize`

## Links
- [YAMDBF Documentation](https://yamdbf.js.org)
- [YAMDBF Discord server](https://discord.gg/cMXkbXV)
- [YAMDBF GitHub](https://github.com/zajrik/yamdbf)
- [YAMDBF Issues](https://github.com/zajrik/yamdbf/issues)
- [YAMDBF Generator](https://github.com/zajrik/generator-yamdbf)
- [YAMDBF NPM](https://www.npmjs.com/package/yamdbf)
