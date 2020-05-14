"use strict";

const FS = require('./fs');

function crashlog(error, data, server) {
    FS('./logs/').isDirectory().catch(() => {
        FS('./logs/').mkdirSync();
    });

    let stack = typeof error === 'string' ? error : error.stack;
    stack += '\nServer ID: ' + server;
	if (data) {
		stack += `\n\nAdditional information:\n`;
		for (const k in data) {
			stack += `  ${k} = ${data[k]}\n`;
		}
	}
	console.error(`\nCRASH: ${stack}\n`);
    const Stream = FS('./logs/errors.log').createAppendStream();
    Stream.on('open', () => {
		Stream.write(`\n${stack}\n`);
		Stream.end();
	}).on('error', (err) => {
		console.error(`\nSUBCRASH: ${err.stack}\n`);
	});
}
exports.log = crashlog;