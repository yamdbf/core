## YAMDBF: Yet Another Modular Discord Bot Framework

[![Discord](https://discordapp.com/api/guilds/233751981838041090/embed.png)](https://discord.gg/cMXkbXV)
[![npm](https://img.shields.io/npm/v/@yamdbf/core.svg?maxAge=3600)](https://www.npmjs.com/package/@yamdbf/core)
[![David](https://david-dm.org/yamdbf/core/status.svg)](https://david-dm.org/yamdbf/core)
[![David](https://david-dm.org/yamdbf/core/peer-status.svg)](https://david-dm.org/yamdbf/core?type=peer)
[![Travis](https://api.travis-ci.org/yamdbf/core.svg)](https://travis-ci.org/yamdbf/core)

<!-- Hidden until someday when scoped packages are supported -->
<!-- [![NPM](https://nodei.co/npm/@yamdbf/core.png?downloads=true&stars=true)](https://nodei.co/npm/yamdbf/) -->

YAMDBF is a lightweight Discord Bot framework for rapid bot development using [Discord.js](https://discord.js.org),
making it simple to get a bot up and running with minimal effort and configuration.

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
    - MySQL
    - MSSQL
- Easy to use Plugin system
- Full TypeScript support (It's written in it!)
  - Support for decorators for simpler handling of:
    - Event listeners
    - Command metadata
    - Command middleware assignment
    - Attaching Logger for logging/debugging

## Installation
Ignore any warnings about unmet peer dependencies as they are all optional unless
using a Sequelize-based storage provider.

>**Note:** YAMDBF Requires > Node 8.0.0 to run

- Regular install: `yarn add @yamdbf/core`
- With the Postgres provider: `yarn add @yamdbf/core pg sequelize`
- With the SQLite provider: `yarn add @yamdbf/core sqlite3 sequelize`
- With the MySQL provider: `yarn add @yamdbf/core mysql2 sequelize`
- With the MSSQL provider: `yarn add @yamdbf/core tedious sequelize`

>Indev builds can be installed from github with `yarn add yamdbf/core#indev`.
This requires `git` to be installed and in your path. Also note that until Yarn
supports submodules in git dependencies, NPM must be used to install YAMDBF indev
at any point that YAMDBF indev is reliant on an indev version of Discord.js

>NPM can also be used for installation.

>Documentation for indev builds can be found [here](https://yamdbf.js.org/indev).

## Links
- [YAMDBF Documentation](https://yamdbf.js.org)
- [YAMDBF Discord server](https://discord.gg/cMXkbXV)
- [YAMDBF GitHub](https://github.com/yamdbf/core)
- [YAMDBF Issues](https://github.com/yamdbf/core/issues)
- [YAMDBF NPM](https://www.npmjs.com/package/@yamdbf/core)
- [YAMDBF Yarnpkg](https://yarnpkg.com/en/package/@yamdbf/core)
- [Zajrik on Patreon](https://patreon.com/zajrik)