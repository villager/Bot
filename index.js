"use strict";
const Tools = require('./tools');

global.Chat = require('./chat');
global.Monitor = require('./lib/monitor.js');

try {
	require.resolve('./config/config');
} catch (err) {
	if (err.code !== 'MODULE_NOT_FOUND') throw err; // should never happen

	console.log('config.js does not exist. Creating one with default settings...');
    fs.writeFileSync(
		'config/config.js',
		fs.readFileSync('config/config-example.js')
	);
}
global.Monitor = require('./lib/monitor.js');

global.Tools = Tools;
global.toId = Tools.toId;
global.splint = Tools.splint;
global.toUserName = Tools.toUserName;

const Config = require('./config/config.js');
global.Config = Config;
global.Servers = Object.create(null);

const Discord = require('./discord');
const Showdown = require('./showdown');
Showdown.connectTimer;

Discord.connect();

Chat.loadPlugins();
console.log(Servers['moonlight']);