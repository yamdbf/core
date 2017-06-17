## Localization
Providing new localizations for the strings your YAMDBF Client sends to Discord is pretty simple overall
but it would be inaccurate to say there's not a lot of work that will go into it. There are a lot of strings
throughout all of the framework functionality and default commands that get sent to Discord so there is
potentially a lot of translating to be done if you wish to provide localizations for any additional languages.

## .lang files
The first thing to cover is the file format. `.lang` is a simple data file format created specifically for
the purpose of providing strings for localization throughout the framework. It's slightly reminiscent of XML
but far simpler in that it only serves to hold key/value pairs where the value is a string. Here are a couple
simple examples:
```
[EXAMPLE_FOO] This is a single line string [/EXAMPLE_FOO]

[EXAMPLE_BAR]
This is a multi-line string.
	Whitespace, like the tab at the beginning of this line
  or the two spaces at the beginning of this line are preserved.

Newlines are preserved as well, though you can \nadd newlines mid-line
as seen in the line above this, here -----------^
[/EXAMPLE_BAR]
```
The identifying string within the opening and closing tag is the key that will be used when retrieving
the string via `Lang.res()` or a LangResourceFunction from `Lang.createResourceFunction()`.

>Note: The closing tag key must match the opening tag key. Nested tags are not supported and, if attempted, will be 
parsed as part of the raw string value of the outer-most surrounding tag

Single-line and inline comments are also allowed, using the syntax `##`:
```
[EXAMPLE_BAZ]
## This is an example of a single-line comment
## Here's another

foo bar baz ## And here's an inline comment
[/EXAMPLE_BAZ] 
```
Comments are removed when parsing. Any text not enclosed within key-tags is inherently treated as a comment
and is ignored when parsing.

## Templating
Unrelated to the `.lang` file format, but a key part of the localization system as a whole is the templating system.
Any token surrounded with `{{ }}` or `{{ ?}}` is a template, and can be replaced at runtime via matching keys within
a {@link TokenReplaceData} object passed to `Lang.res()` or a LangResourceFunction from `Lang.createResourceFunction()`.
For example:
```
[TEMPLATE_EXAMPLE]
foo {{ barTemplate }} baz
[/TEMPLATE_EXAMPLE]

Lang.res('en_us', 'TEMPLATE_EXAMPLE', { barTemplate: 'bar' }) // Produces: 'foo bar baz'
```
Templates with a question mark (`{{ foo ?}}`) are "maybe templates". If a value is not given for that template it will
be removed when loaded. If a maybe template is the only thing occupying a line and no value is given for it, it will be
removed and a blank line will not be left behind:
```
[MAYBE_TEMPLATE_EXAMPLE]
foo{{ barTemplate ?}}baz
{{ emptyTemplate ?}}
boo
[/MAYBE_TEMPLATE_EXAMPLE]

Lang.res('en_us', 'MAYBE_TEMPLATE_EXAMPLE') // Produces: 'foobaz\nboo'
```
>Note: Passing empty strings for maybe templates results in them being removed in the same manner as if no value was given

## Default localization strings
When translating these strings for your own localizations, remember that it's not necessary to place them all into a single
file. You can separate them into multiple files and they will all be loaded and merged together into a single set of strings
for one language as long as they all have the same language name as the first part of the file name. For example, you could
separate strings used in two separate commands into files `en_us.cmd.foo.lang` and `en_us.cmd.bar.lang`.

>Note: Anything after the language name and before `.lang` in a lang file's filename is not used for anything and can simply
be used as a distinction between different lang files for the same language.


This list may be incomplete during development until YAMDBF 3.0.0 is finalized.

	[CMD_HELP_SERVERONLY] [Server Only] [/CMD_HELP_SERVERONLY]
	
	[CMD_HELP_OWNERONLY] [Owner Only] [/CMD_HELP_OWNERONLY]
	
	[CMD_HELP_ALIASES] Aliases: {{ aliases }} [/CMD_HELP_ALIASES]
	
	[CMD_HELP_CODEBLOCK]
	## I feel ldif is the best codeblock language for
	## displaying all of the help commands but it could
	## be changed without any consequence if desired
	```ldif
	{{ serverOnly ?}}
	{{ ownerOnly ?}}
	Command: {{ commandName }}
	Description: {{ desc }}
	{{ aliasText ?}}
	Usage: {{ usage }}
	{{ info ?}}
	```
	[/CMD_HELP_CODEBLOCK]
