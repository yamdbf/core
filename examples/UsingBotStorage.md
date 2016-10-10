Using the bot's default persistent storage is very easy, but it should be noted that this storage is universal, unlike guild-specific storage. If you want to use storage for values specific to an individual guild, you should head on over to {@tutorial UsingGuildStorage}.

The bot's default storage can be accessed via `storage` property of the Bot instance. We'll assume here that you're going to be accessing the storage from within a command action, and thus have access to the Bot instance via `this.bot`:

```js
let storage = this.bot.storage;
```

We'll be using this `storage` variable for the rest of the examples.

## Storing values
Storing values is done with the [setItem()]{@link LocalStorage#setItem} method. Let's say we know the storage contains the key `'foo'`. We want to assign the vale `'bar'` to the key `'foo'` in storage:

```js
storage.setItem('foo', 'bar');
```

If you only need to interact when storage once, there's no need to load the storage into a variable first. You can interact with storage directly, in-line, like so:

```js
this.bot.storage.setItem('foo', 'bar');
```

It should be noted that if a key does not exist in storage it will be created when using `setItem()`.

## Retrieving and modifying values
Earlier we set the value of the key `'foo'`, so now we'll pull it back out of storage.

```js
let foo = storage.getItem('foo');
// foo === 'bar'

// Now we'll modify it:

storage.setItem('foo', 'boo');
foo = storage.getItem('foo');
// foo === 'boo'
```

## Storing and modifying stored objects
Objects can be placed in storage just as easily as any other value, but modifying them requires a little extra effort. You'll need to pull the object out of storage, modify it, and then put it back in:

```js
let oldObject = {
    foo: 'bar',
    bar: 'baz'
}

storage.setItem('object', oldObject);

// Now, let's modify it!

let newObject = storage.getItem('object');
newObject.foo = 'boo';
storage.setItem('object', newObject);
console.log(storage.getItem('object'));
// logs: { foo: 'boo', bar: 'baz' }
```

Of course, you can store Arrays as well:

```js
let array = ['foo', 'bar'];

storage.setItem('array', array);

let newArray = storage.getItem('array')
newArray.push('baz');
storage.setItem('array', newArray);
console.log(storage.getItem('array'));
// logs: ['foo', 'bar', 'baz']
```

As far as the basics of storage go, that's about it. Make sure to check out {@link LocalStorage} to read up on the methods available for interacting with storages using the `LocalStorage` class. You can even declare your own storages separate from the bot's default storage. The docs should point you in the right direction for this, but as always you can ask questions on the YAMDB Discord server if you have any.

If you haven't already, take a look at {@tutorial UsingGuildStorage} to read up on using guild-specific storages in your bot.
