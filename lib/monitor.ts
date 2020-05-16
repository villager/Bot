/**
 * Crash logger
 * Pokemon Showdown - http://pokemonshowdown.com/.
 *
 * @license MIT
 */

import * as fs from 'fs';
import * as path from 'path';
const logPath = path.resolve(__dirname, '../logs/errors.log');


/**
 * Logs when a crash happens to console, then e-mails those who are configured
 * to receive them.
 */
export function log(error : Error | string , data : AnyObject  , server : string) {
    let stack = typeof error === 'string' ? error : error.stack;
    stack += '\nServer ID: ' + server;
	if (data) {
		stack += `\n\nAdditional information:\n`;
		for (const k in data) {
			stack += `  ${k} = ${data[k]}\n`;
		}
	}
	console.error(`\nCRASH: ${stack}\n`);
	const Stream = fs.createWriteStream(logPath, {flags: 'a'});
    Stream.on('open', () => {
		Stream.write(`\n${stack}\n`);
		Stream.end();
	}).on('error', (err) => {
		console.error(`\nSUBCRASH: ${err.stack}\n`);
	});
}
