So you want to store some stuff for a specific guild. The most likely occurrence of this is a user calling a command that requires interacting guild-specific data, either storing or retrieving. Accessing guild specific data from within a command is really easy because you have access to the guild in question via the {@link external:Message} object passed to the command under the `message` parameter.

Because `message` contains a guild, we can use it to find the {@link GuildStorage} for that guild. If you have a lot of separate items you want to set in storage for a guild, it may be easiest to load the guild storage into a local variable:

```js
let guildStorage = this.bot.guildStorages.get(message.guild);
```
We will be using this `guildStorage` variable for the remainder of this example page.

## Storing values
Storing values is done using the [setItem()]{@link GuildStorage#setItem} method.
Let's say we know the storage for this guild contains the key `'foo'`. We want to assign the value `'bar'` to the key `'foo'` in this guild's storage:

```js
guildStorage.setItem('foo', 'bar');
```

Now that was easy! If you only need to set the one item in storage there's no need to load the guildStorage into a local variable. You can interact with the storage directly, in-line, like so:

```js
this.bot.guildStorages.get(message.guild).setItem('foo', 'bar');
```

It should be noted that if a key does not yet exist in storage, it will be created when using `setItem()`.

## Retrieving values

Retrieving values from a guild's storage is just as easy as setting them. Assuming you still have the guild storage loaded into a local variable as demonstrated earlier, use [getItem()]{@link GuildStorage#getItem}:

```js
let foo = guildStorage.getItem('foo');
// foo === 'bar'
```

This can also be done in-line as before in the storing values example.

## Interacting with guild settings
In addition to guild-specific storage, every guild has settings within its own storage that are able to be interacted with via different methods than regular guild storage. See: {@link GuildStorage} for more information.

Interacting with settings values is just as easy as interacting with storage values. Settings are keys that have default values that are applied to all new guilds whenever the bot is added to a guild. New default settings can also be added
to all guilds which can then, of course, be changed per guild as code that interacts with those settings is run.

For this example we'll use the `'prefix'` setting, and we'll be ignoring the fact that there's a shortcut to access the prefix value via `this.bot.getPrefix(<guild>)`.

```js
let prefix = guildStorage.getSetting('prefix');
// prefix === '/' by default. This can of course be changed
```

And of course, to set the value:

```js
let newPrefix = '+';
guildStorage.setSetting('prefix', newPrefix);
console.log(guildStorage.getSetting('prefix'));
// logs: +
```

## Storing Objects
Objects can be stored in guild-specific storage just as easily as any other value, but modifying them requires a little extra effort. You'll need to pull the object out of storage, modify it, and then put it back in:

```js
let oldObject = {
	foo: 'bar',
	bar: 'baz'
}

guildStorage.setItem('object', oldObject);

// Now, let's modify it!

let newObject = guildStorage.getItem('object');
newObject.foo = 'boo';
guildStorage.setItem('object', newObject);
console.log(guildStorage.getItem('object'));
// logs: { foo: 'boo', bar: 'baz' }
```

And that's about it for using guild specific storage! There is so much that can be done by utilizing guild-specific data but it's up to find your own uses for it! Don't forget to check out the docs for {@link GuildStorage} to read up on all the methods available for interacting with guild-specific storage and settings. It would also be good to read {@tutorial UsingBotStorage} if you haven't already. Knowing the applications and differences between the two storages will leave you with a pretty handy tool for writing your bots!
