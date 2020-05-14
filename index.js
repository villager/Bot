"use strict";

const WebSocket = require('ws');
const request = require("request");
const EventEmitter = require('events').EventEmitter;
const Monitor = global.Monitor = require('./lib/monitor.js');
const fs = require('fs');
let roomList = Object.create(null);
let Servers = Object.create(null);

global.Chat = require('./chat');
global.splint = function (target, separator, length) {
	if (!separator) separator = ',';

	let cmdArr = [];
	if (length > 0) {
		let sepIndex = -1;
		for (let count = 0; ; count++) { // jscs:ignore disallowSpaceBeforeSemicolon
			sepIndex = target.indexOf(separator);
			if (count + 1 === length) {
				cmdArr.push(target);
				break;
			} else if (sepIndex === -1) {
				cmdArr.push(target);
				break;
			} else {
				cmdArr.push(target.to(sepIndex));
				target = target.from(sepIndex + 1);
			}
		}
	} else if (length < 0) {
		let sepIndex = -1;
		for (let count = length; ; count++) { // jscs:ignore disallowSpaceBeforeSemicolon
			sepIndex = target.lastIndexOf(separator);
			if (count === -1) {
				cmdArr.unshift(target);
				break;
			} else if (sepIndex === -1) {
				cmdArr.unshift(target);
				break;
			} else {
				cmdArr.unshift(target.from(sepIndex + 1));
				target = target.to(sepIndex);
			}
		}
	} else {
		cmdArr = target.split(separator);
	}
	return cmdArr.map('trim');
};

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
const Config = require('./config/config.js');
global.Config = Config;
const Discord = require('./discord/client.js');

function toId(text) {
    if (text && text.id) {
        text = text.id;
    } else if (text && text.userid) {
        text = text.userid;
    } else if (text && text.roomid) {
        text = text.roomid;
    }
    if (typeof text !== 'string' && typeof text !== 'number') return '';
    return ('' + text).toLowerCase().replace(/[^a-z0-9]+/g, '');
}
global.toId = toId;
class Bot extends EventEmitter {
    constructor(server) {
        super();
        this.id = server.id;
        this.ip = server.ip;
        this.port = server.port;
        this.name = server.name;
        this.pass = server.password;
        this.connection = new WebSocket(`ws://${this.ip}:${this.port}/showdown/websocket`);   
        let self = this;
        this.connection.on('open', function () {
            console.log(`${self.name} conectado correctamente a ${self.id}`);
			self.connected = true;
		});

		this.connection.on('error', function (error) {
            Monitor.log(error, false, self.id);
		});

		this.connection.on('message', function (data) {
			//log('> [' + self.id + '] ' + data, self.id);
			var roomid = 'lobby';
			if (data.charAt(0) === '>') {
				roomid = data.substr(1, data.indexOf('\n') - 1);
				data = data.substr(data.indexOf('\n') + 1, data.length);
			}
			if (roomid.substr(0, 6) === 'battle') {
				var split = data.split('\n');
				for (var line in split) {
					self.parse(roomid, split[line]);
				}
				return;
            }
			self.parse(roomid, data);
		}); 
    }
    send(msg, room) {
        if(!room) room = '';
        try {
            this.connection.send(`${room}|${msg}`)
        } catch(err) {
            Monitor.log(err, `Sending ${room}|${message} crashed`, this.id);
        }
    }
    login(name, password) {
		var self = this;
		var options;
		if (password !== '') {
			options = {
				headers: {
					'content-type': 'application/x-www-form-urlencoded'
				},
				url: 'http://play.pokemonshowdown.com/action.php',
				body: "act=login&name=" + encodeURIComponent(name) + "&pass=" + encodeURIComponent(password) + "&challengekeyid=" + this.challengekeyid + "&challenge=" + this.challenge
			};
			request.post(options, callback);
		} else {
			options = {
				url: 'http://play.pokemonshowdown.com/action.php?act=getassertion&userid=' + toId(name) + '&challengekeyid=' + this.challengekeyid + '&challenge=' + this.challenge
			};
			request(options, callback);
		}

		function callback(error, response, body) {
			if (body === ';') return log('Failed to log in, name is registered', self.serverid);
			if (body.length < 50) return log('Failed to log in: ' + body, self.serverid);
			if (~body.indexOf('heavy load')) {
				log('Failed to log in - login server is under heavy load. Retrying in one minute.', self.serverid);
				setTimeout(function () {
					self.login(name, pass);
				}, 60 * 1000);
				return;
			}
			if (body.substr(0, 16) === '<!DOCTYPE html>') {
				log('Connection error 522 - retrying in one minute', self.serverid);
				setTimeout(function () {
					self.login(name, pass);
				}, 60 * 1000);
				return;
			}
			try {
				var json = JSON.parse(body.substr(1, body.length));
				if (json.actionsuccess) {
					self.send('/trn ' + name + ',0,' + json['assertion']);
				} else {
					log('Could not log in: ' + JSON.stringify(json), self.serverid);
				}
			} catch (e) {
				self.send('/trn ' + name + ',0,' + body);
			}
		}
    }
    joinRoom(room) {
        this.send(`/join ${room}`);
    }
    joinAllRooms() {
        if(!roomList[this.id]) return;
        for (let i in roomList[this.id]) {
            for (const room of roomList[this.id][i]) {
                this.send(`/join ${room}`);
            }
        }
    }
    pmReply(user, data) {
        this.parse(`/pm ${user}, ${data}`);
    }
    sendReply(message, pm) {
        if(pm) {
            this.parseChat()
        }

    }
    parse(roomid, data) {
	var server = Config.servers[this.id];
		if (data.charAt(0) !== '|') data = '||' + data;
		let parts =(data).split('|');
		switch (parts[1]) {
		case 'challstr':
			this.challengekeyid = parts[2];
			this.challenge = parts[3];
			this.login(server.name, server.password);
			break;
		case 'c:':
//			this.parseChat(roomid, parts[3], parts.slice(4).join('|'), '');
//			this.logChat(toId(roomid), data);
			break;
		case 'c':
//			this.parseChat(roomid, parts[2], parts.slice(3).join('|'), '');
			//this.logChat(toId(roomid), data);
			break;
		case 'updateuser':
			if (toId(parts[2]) !== toId(server.name)) return;
			this.send('/cmd rooms');
			if (!server.joinedRooms && parts[3] === '1') {
				if (typeof server.rooms === "object") {
					for (var u in server.rooms) this.send('/join ' + server.rooms[u]);
					this.joinedRooms = true;
				}
				for (var i in server.privaterooms) this.send('/join ' + server.privaterooms[i]);
			}
			break;
		case 'pm':
	//		if (~parts[4].indexOf('/invite') && Commands.hasPermission(parts[2], 'invite')) return server.send('/join ' + parts[4].remove('/invite '));
	//		this.parseChat(roomid, parts[2], parts.slice(4).join('|'), '/msg ' + parts[2] + ', ');
	//		sendTell(parts[2].substr(1, parts[2].length), server);
			break;
		case 'join':
		case 'j':
		case 'J':
			break;
		case 'l':
		case 'L':
			break;
		case 'raw':
		case 'html':
			break;
		case 'queryresponse':
			switch (parts[2]) {
			case 'rooms':
				if (parts[3] === 'null') break;
                let roomData = JSON.parse(parts.slice(3));
                if(!roomList[this.id]) {
                    roomList[this.id] = {};
                }
                for (let i in roomData['official']) {
                    if(!roomList[this.id].isOfficial) roomList[this.id].isOfficial = [];
					roomList[this.id].isOfficial.push(roomData['official'][i].title);
                }
                for (let i in roomData['chat']) {
                    if(!roomList[this.id].isChat)roomList[this.id].isChat = [];
                    roomList[this.id].isChat.push(roomData['chat'][i].title);
                }
				if (!server.joinedRooms) {
					if (server.rooms === 'all') {
						this.joinAllRooms(true);
						server.joinedRooms = true;
					} else if (server.rooms === 'official') {
						this.joinAllRooms(false);
						server.joinedRooms = true;
					}
				}
				break;
			}
			break;
		case 'N':
			if (~data.indexOf('\n')) {
			//	this.logChat(toId(roomid), data.trim());
			}
			break;
		case '':
			//this.logChat(toId(roomid), parts.slice(2).join('|'));
			break;
		}
    }
    parseChat (room, user, message) {
		if (!pm) pm = '';
		if (message.charAt(0) === Config.trigger) {
			var command = toId(message.substr(1, (~message.indexOf(' ') ? message.indexOf(' ') : message.length)));
			var target = (~message.indexOf(' ') ? message.substr(message.indexOf(' '), message.length) : '');
			if (Chat.commands[command]) {
				while (typeof Chat.commands[command] !== 'function') {
					command = Chat.commands[command];
				}
				if (typeof Chat.commands[command] === 'function') {
					try {
						Chat.commands[command].call(this, target, room, user);
					} catch (e) {
						Monitor.log(e.stack, this.id);
					}
				}
			}
		}
	}
}

function connect(server) {
	if (!Config.servers[server]) return console.log('Server "' + server + '" not found.');
	server = Config.servers[server];
	if (server.disabled) return;
	if (Servers[server.id]) return console.log('Already connected to ' + server.id + '. Connection aborted.', server.id);
	Servers[server.id] = new Bot(server);
	//console.log('Connecting to ' + server.id);
}

function disconnect(server, reconnect) {
	var serverid = toId(server);
	if (!Servers[serverid]) return console.log('Not connected to ' + serverid + '.', serverid);
	Servers[serverid].connection.close();
	this.connected = false;
	this.disconnecting = true;
	if (Servers[serverid].ping) clearInterval(Servers[serverid].ping);
	delete Servers[serverid];
	console.log("Disconnected from " + serverid + ".", serverid);
	if (reconnect) connect(serverid);
}

var count = 0;
var connectTimer = setInterval(function () {
	if (!Object.keys(Config.servers)[count]) return clearInterval(connectTimer);
	connect(Object.keys(Config.servers)[count]);
	count++;
}, 5000); // this delay is to avoid problems logging into multiple servers so quickly

Discord.connect();
