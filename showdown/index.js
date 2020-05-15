"use strict";

const WebSocket = require('ws');
const request = require("request");
const EventEmitter = require('events').EventEmitter;
let roomList = Object.create(null);
const DEFAULT_ROOM = 'lobby';

class Bot extends EventEmitter {
    constructor(server) {
        super();
        this.id = server.id;
        this.ip = server.ip;
        this.port = server.port;
        this.name = server.name;
		this.pass = server.password;
		this.rooms = server.rooms;
		this.formats = Object.create(null); // No sabemos que formatos tienen :/
        this.connection = new WebSocket(`ws://${this.ip}:${this.port}/showdown/websocket`);   
		this.connected = false;
		this.parser = new Parser(this);
		this.connection.on('open', () => {
			console.log(`${this.name} conectado correctamente a ${this.id}`);
			this.connected = true;
		});

		this.connection.on('error', () => {
            Monitor.log(error, false, this.id);
		});

		this.connection.on('message', data => {
			if (typeof data !== "string") {
				data = JSON.stringify(data);
			}
			this.lastMessage = Date.now();
			this.emit('message', data);
			this.receive(data);
		}); 
		Servers[this.id] = this;
	}
	sendRoom = function (room, data) {
		if (!(data instanceof Array)) {
			data = [data.toString()];
		}
		for (let i = 0; i < data.length; i++) {
			data[i] = room + '|' + data[i];
		}
		return this.connection.send(data);
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
			if (body === ';') return log('Failed to log in, name is registered', self.id);
			if (body.length < 50) return log('Failed to log in: ' + body, self.id);
			if (~body.indexOf('heavy load')) {
				log('Failed to log in - login server is under heavy load. Retrying in one minute.', self.serverid);
				setTimeout(function () {
					self.login(name, pass);
				}, 60 * 1000);
				return;
			}
			if (body.substr(0, 16) === '<!DOCTYPE html>') {
				log('Connection error 522 - retrying in one minute', self.id);
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
					log('Could not log in: ' + JSON.stringify(json), self.id);
				}
			} catch (e) {
				self.send('/trn ' + name + ',0,' + body);
			}
		}
    }
    joinRoom(room) {
		this.rooms[room] = {};
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
	updateFormats(formats) {
		let formatsArr = formats.split('|');
		let commaIndex, formatData, code, name;
		this.formats = {};
		for (let i = 0; i < formatsArr.length; i++) {
			commaIndex = formatsArr[i].indexOf(',');
			if (commaIndex === -1) {
				this.formats[toId(formatsArr[i])] = {name: formatsArr[i],
					team: true, ladder: true, chall: true};
			} else if (commaIndex === 0) {
				i++;
				continue;
			} else {
				name = formatsArr[i];
				formatData = {name: name, team: true, ladder: true, chall: true};
				code = commaIndex >= 0 ? parseInt(name.substr(commaIndex + 1), 16) : NaN;
				if (!isNaN(code)) {
					name = name.substr(0, commaIndex);
					if (code & 1) formatData.team = false;
					if (!(code & 2)) formatData.ladder = false;
					if (!(code & 4)) formatData.chall = false;
					if (!(code & 8)) formatData.disableTournaments = true;
				} else {
					if (name.substr(name.length - 2) === ',#') { // preset teams
						formatData.team = false;
						name = name.substr(0, name.length - 2);
					}
					if (name.substr(name.length - 2) === ',,') { // search-only
						formatData.chall = false;
						name = name.substr(0, name.length - 2);
					} else if (name.substr(name.length - 1) === ',') { // challenge-only
						formatData.ladder = false;
						name = name.substr(0, name.length - 1);
					}
				}
				formatData.name = name;
				this.formats[toId(name)] = formatData;
			}
		}
	}
	receive(msg) {
		this.receiveMsg(msg);
	}
	receiveMsg(msg) {
		if (!msg) return;
		if (msg.includes('\n')) {
			let lines = msg.split('\n');
			let room = DEFAULT_ROOM;
			let firstLine = 0;
			if (lines[0].charAt(0) === '>') {
				room = lines[0].substr(1) || DEFAULT_ROOM;
				firstLine = 1;
			}
			for (let i = firstLine; i < lines.length; i++) {
				if (lines[i].split('|')[1] === 'init') {
					for (let j = i; j < lines.length; j++) {
						this.parse(room, lines[j], true);
					}
					break;
				} else {
					this.parse(room, lines[i], false);
				}
			}
		} else {
			this.parse(DEFAULT_ROOM, msg, false);
		}
	}
    parse(roomid, data, isInit) {
		let server = Config.servers[this.id];
		if (data.charAt(0) !== '|') data = '||' + data;
		let parts =(data).split('|');
		let spl = data.substr(1).split('|');
		this.emit('line', this, roomid, data, isInit, spl);
		if (spl[1]) {
			var thisEvent = (spl[0].charAt(0) !== '-') ? 'major' : 'minor';
			this.emit(thisEvent, roomid, spl[0], data.substr(spl[0].length + 2), isInit);
		} else {
			this.emit('major', roomid, '', data, isInit);
		}
		switch (parts[1]) {
		case 'formats':
			let formats = data.substr(parts[1].length + 2);
			this.updateFormats(formats);
			this.emit('formats', formats);
			break;
		case 'challstr':
			this.challengekeyid = parts[2];
			this.challenge = parts[3];
			this.login(server.name, server.password);
			break;
		case 'c:':
			if(isInit) break;
			this.parser.parse(roomid, parts[3], parts.slice(4).join('|').replace('\n', ''));
//			this.logChat(toId(roomid), data);
			break;
		case 'c':
			if(isInit) break;
			this.parser.parse(roomid, parts[2], parts.slice(3).join('|').replace('\n', ''));
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
			this.parser.parse(roomid, parts[2], parts.slice(4).join('|'), true);
	//		if (~parts[4].indexOf('/invite') && Commands.hasPermission(parts[2], 'invite')) return server.send('/join ' + parts[4].remove('/invite '));
	//		sendTell(parts[2].substr(1, parts[2].length), server);
			break;
		case 'join':
		case 'j':
		case 'J':
			break;
		case 'l':
		case 'L':
			break;
		case 'init':
			this.rooms[roomid] = {
				type: parts[2] || 'chat',
				title: '',
				users: {},
				userCount: 0
			};
			this.roomcount = Object.keys(this.rooms).length;
			this.emit('joinRoom', roomid, this.rooms[roomid].type);

			break;
		case 'deinit':
				if (this.rooms[roomid]) {
					this.emit('leaveRoom', roomid);
					delete this.rooms[roomid];
					this.roomcount = Object.keys(this.rooms).length;
				}
			break;
			case 'title':
				if (this.rooms[roomid]) this.rooms[roomid].title = parts[2];
				break;
			case 'users':
				if (!this.rooms[roomid]) break;
				var userArr = data.substr(7).split(",");
				this.rooms[roomid].userCount = parseInt(userArr[0]);
				for (var k = 1; k < userArr.length; k++) {
					this.rooms[roomid].users[toId(userArr[k])] = userArr[k];
				}
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
}
class Parser {
	constructor(bot) {
		this.bot = bot;

	}
	splitCommand(message) {
		this.cmd = '';
		this.cmdToken = '';
		this.target = '';
		if (!message || !message.trim().length) return;


        let cmdToken = message.charAt(0);
        if(Config.trigger !== cmdToken) return;
		if (cmdToken === message.charAt(1)) return;
		let cmd = '', target = '';
		let spaceIndex = message.indexOf(' ');
		if (spaceIndex > 0) {
			cmd = message.slice(1, spaceIndex).toLowerCase();
			target = message.slice(spaceIndex + 1);
		} else {
			cmd = message.slice(1).toLowerCase();
			target = '';
		}

		let curCommands = Chat.psCommands;
		let commandHandler;
		let fullCmd = cmd;

		do {
			if (Object.prototype.hasOwnProperty.call(curCommands, cmd)) {
				commandHandler = curCommands[cmd];
			} else {
				commandHandler = undefined;
			}
			if (typeof commandHandler === 'string') {
				// in case someone messed up, don't loop
				commandHandler = curCommands[commandHandler];
			} else if (Array.isArray(commandHandler) && !recursing) {
				return this.splitCommand(cmdToken + 'help ' + fullCmd.slice(0, -4), true);
			}
			if (commandHandler && typeof commandHandler === 'object') {
				let spaceIndex = target.indexOf(' ');
				if (spaceIndex > 0) {
					cmd = target.substr(0, spaceIndex).toLowerCase();
					target = target.substr(spaceIndex + 1);
				} else {
					cmd = target.toLowerCase();
					target = '';
				}

				fullCmd += ' ' + cmd;
				curCommands = commandHandler;
			}
		} while (commandHandler && typeof commandHandler === 'object');

		if (!commandHandler && curCommands.default) {
			commandHandler = curCommands.default;
			if (typeof commandHandler === 'string') {
				commandHandler = curCommands[commandHandler];
			}
		}
		this.cmd = cmd;
		this.cmdToken = cmdToken;
		this.target = target;
		this.fullCmd = fullCmd;

		return commandHandler;
	}
	sendReply(data) {
		if(this.pmTarget) {
			this.bot.send(`/pm ${this.pmTarget}, ${data}`, this.room);	
		} else {
			this.bot.send(data, this.room);			
		}
	}
	can(permission) {
		for (const owner of Config.owners) {
			for (const nick of owner.aliases) {
				if(toUserName(nick) === toUserName(this.user)) return true;
			}
		}
		this.sendReply('Acceso Denegado');
		return false;
	}
    parse(room, user, message, pm) {
		this.pmTarget = '';
		this.bot.lastMessage = message;
		this.bot.lastUser = user;
		let commandHandler = this.splitCommand(message);
		if (typeof commandHandler === 'function') {
			if(toId(this.bot.lastUser) === toId(Config.name)) return; // Ignorar los  comandos dichos por el mismo bot
            this.user = user;
			this.message = message;
			this.room = room;
			if(pm) this.pmTarget = user;
        	this.run(commandHandler);
		}        
    }
	runHelp(help) {
		let commandHandler = this.splitCommand(`.help ${help}`);
		this.run(commandHandler);
	}
	run(commandHandler) {
        if (typeof commandHandler === 'string') commandHandler = Chat.psCommands[commandHandler];
		let result;
		try {
			result = commandHandler.call(this, this.target, this.room, this.user, this.message);
		} catch (err) {
			Monitor.log(err,{
				user: this.user.username,
				message: this.message,
				pmTarget: this.pmTarget && this.pmTarget,
				room: this.room,
			}, this.bot.id);;
		}
		if (result === undefined) result = false;
		return result;      
    }
}
function connect(server) {
	if (!Config.servers[server]) return console.log('Server "' + server + '" not found.');
	server = Config.servers[server];
	if (server.disabled) return;
	if (Servers[server.id]) return console.log('Already connected to ' + server.id + '. Connection aborted.', server.id);
	Servers[server.id] = new Bot(server);
	const Battle = require('./battle');
	Battle.init();
	Servers[server.id].on('line', (sv, room, message, isIntro, spl) => {
		Battle.parse(sv, room, message, isIntro, spl);
	});
	//console.log('Connecting to ' + server.id);
}
exports.connect = connect;
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
exports.disconnect = disconnect;
var count = 0;

const connectTimer =setInterval(function () {
        if (!Object.keys(Config.servers)[count]) return clearInterval(connectTimer);
        connect(Object.keys(Config.servers)[count]);
        count++;
}, 5000); // this delay is to avoid problems logging into multiple servers so quickly
exports.connectTimer = connectTimer;