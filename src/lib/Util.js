'use babel';
'use strict';

export function padRight(text, len)
{
	return text + ' '.repeat(len - text.length);
}
