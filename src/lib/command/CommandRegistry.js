'use babel';
'use strict';

export default class CommandRegistry extends Map
{
	constructor()
	{
		super();
	}

	// Complete registration of command and add to CommandRegistry storage
	register(command, key)
	{
		if (super.has(command.name)) throw new Error(`A command with the name "${command.name}" already exists.`);
		command.register();
		super.set(key, command);
	}
}
