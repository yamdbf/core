## YAMDBF: Yet Another Modular Discord Bot Framework

[![Discord](https://discordapp.com/api/guilds/233751981838041090/embed.png)](https://discord.gg/cMXkbXV)
[![npm](https://img.shields.io/npm/v/yamdbf.svg?maxAge=3600)](https://www.npmjs.com/package/yamdbf)
[![David](https://img.shields.io/david/zajrik/yamdbf.svg?maxAge=3600)](https://david-dm.org/zajrik/yamdbf)
[![Travis](https://api.travis-ci.org/zajrik/yamdbf.svg)](https://travis-ci.org/zajrik/yamdbf)
[![CircleCI](https://circleci.com/gh/zajrik/yamdbf.svg?style=shield)](https://circleci.com/gh/zajrik/yamdbf)

[![NPM](https://nodei.co/npm/yamdbf.png?downloads=true&stars=true)](https://nodei.co/npm/yamdbf/)

YAMDBF is a lightweight Discord Bot framework for rapid bot development using [Discord.js](https://discord.js.org),
making it simple to get a bot up and running with minimal effort and configuration. 

## Features
- Base commands for control over default settings
- Full control over all base commands via disabling or overloading
- Simple structure for creation of custom commands
- Automatic custom command loading
- Fine control of command execution per-user/globally via configurable ratelimits
- Robust middleware system for fine control of execution flow and  
  control over the data passed to your commands
  - Ships with methods for resolving different data types and ensuring  
    certain args/types are passed to commands
- Easy to use settings/storage with support for custom storage providers
- Full TypeScript support (It's written in it!)
  - Support for decorators for simpler handling of:
	- Event listeners
    - Command metadata
	- Command middleware assignment
	- Attaching Logger for logging/debugging

## Links
- [YAMDBF Documentation](https://yamdbf.js.org)
- [YAMDBF Discord server](https://discord.gg/cMXkbXV)
- [YAMDBF GitHub](https://github.com/zajrik/yamdbf)
- [YAMDBF Issues](https://github.com/zajrik/yamdbf/issues)
- [YAMDBF Generator](https://github.com/zajrik/generator-yamdbf)
- [YAMDBF NPM](https://www.npmjs.com/package/yamdbf)
