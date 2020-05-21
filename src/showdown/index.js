"use strict";

const WebSocket = require('ws');
const request = require('request');
const EventEmitter = require('events').EventEmitter;
const DEFAULT_ROOM = 'lobby';
const Parser = require('./chat');
const Room = require('./rooms');

let roomList = Object.create(null);

class PSBot extends EventEmitter {
    constructor(opts) {
        super();
        this.id = opts.id;
        this.ip = opts.ip;
        this.connected = false;
        this.port = opts.port;
		this.rooms =  {};
		this.name = opts.name;
		this.pass = opts.password;
		this.named = false;
        this.baseRooms = opts.rooms;
        this.formats = Object.create(null);
        this.lastMessage = undefined;
        this.disconnecting = false;
        this.joinedRooms = false;
        this.roomcount = 0;
        this.challengekeyid = '';
		this.challenge = '';
		this.autoreconnect = true;
		this.users = new Map();
		this.group = '';
		this.language = opts.language;
        this.parser = new Parser(this);
        this.connection = new WebSocket(`ws://${this.ip}:${this.port}/showdown/websocket`);    

    }
    get botNick() {
        return this.bot.name;
    }
    connect() {
        this.connection.on('open', () => {
			console.log(`${this.name} conectado correctamente a ${this.id}`);
			this.connected = true;
			Features.init(this);
        });
		this.connection.on('error', (error) => {
            console.log('Error: ' + error + ' Server: ' +  this.id);
            Monitor.log(error, null, this.id);
		});
		this.connection.on('message', data => {
			if (typeof data !== "string") {
				data = JSON.stringify(data);
			}
			this.receive(data);
		});


    }
	receive(msg) {
        this.lastMessage = Date.now();
        this.emit('message', msg);
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
		Features.parse(this, roomid, data, isInit, spl);
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
			this.login(this.name, this.pass);
			break;
		case 'c:':
			if(isInit) break;
			if(Features('profiles').get(toId(parts[3]))) Features('profiles').get(toId(parts[3])).updateSeen(this.id, 'TALKING', roomid);
			this.parser.parse(roomid, parts[3], parts.slice(4).join('|').replace('\n', ''), false);
//			this.logChat(toId(roomid), data);
			break;
		case 'c':
			if(isInit) break;
			this.parser.parse(roomid, parts[2], parts.slice(3).join('|').replace('\n', ''), false);
//			this.parseChat(roomid, parts[2], parts.slice(3).join('|'), '');
			//this.logChat(toId(roomid), data);
			break;
		case 'updateuser':
			if (toId(parts[2]) !== toId(server.name)) return;
			this.send('/cmd rooms');
			let cmds = Features.initCmds(this);
			cmds.push(`/user ${this.name}`)
			for (const cmd of cmds) this.send(cmd);
			if (!this.joinedRooms && parts[3] === '1') {
				if (Array.isArray(this.baseRooms)) {
                    for (const room of this.baseRooms) this.joinRoom(room);
					this.joinedRooms = true;
				}
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
			if(Features('profiles').get(parts[2])) Features('profiles').get(parts[2]).updateSeen(this.id, 'JOIN', roomid);
			break;
		case 'l':
		case 'L':
			if(Features('profiles').get(parts[2])) Features('profiles').get(parts[2]).updateSeen(this.id, 'LEAVE', roomid);
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
				case 'userdetails':
					console.log('entra aqui');
					let data = JSON.parse(parts[3]);
					if(data.id !== toId(this.name)){
						let data = JSON.parse(parts[3]);
						if(data.group) this.group = data.group;						
					}
				break;
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
				if (!this.joinedRooms) {
					if (this.baseRooms[0] === 'all') {
						this.joinAllRooms();
						this.joinedRooms = true;
					} else if (this.baseRooms === 'official') {
						this.joinAllRooms();
						this.joinedRooms = true;
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
    send(msg, room) {
        if(!room) room = '';
        try {
            this.connection.send(`${room}|${msg}`)
        } catch(err) {
            Monitor.log(err, `Sending ${room}|${msg} crashed`, this.id);
        }
    }
    login(name, pass) {
		let self = this;
		let options;
		if (pass !== '') {
			options = {
				headers: {
					'content-type': 'application/x-www-form-urlencoded'
				},
				url: 'http://play.pokemonshowdown.com/action.php',
				body: "act=login&name=" + encodeURIComponent(name) + "&pass=" + encodeURIComponent(pass) + "&challengekeyid=" + this.challengekeyid + "&challenge=" + this.challenge
			};
			request.post(options, callback);
		} else {
			options = {
				url: 'http://play.pokemonshowdown.com/action.php?act=getassertion&userid=' + toId(name) + '&challengekeyid=' + this.challengekeyid + '&challenge=' + this.challenge
			};
			request(options, callback);
		}
		function callback(error, response, body) {
			if (body === ';') return console.log('Failed to log in, name is registered', self.id);
			if (body.length < 50) return console.log('Failed to log in: ' + body, self.id);
			if (~body.indexOf('heavy load')) {
				console.log('Failed to log in - login server is under heavy load. Retrying in one minute.', self.id);
				setTimeout(function () {
					self.login(name, pass);
				}, 60 * 1000);
				return;
			}
			if (body.substr(0, 16) === '<!DOCTYPE html>') {
				console.log('Connection error 522 - retrying in one minute', self.id);
				setTimeout(function () {
					self.login(name, pass);
				}, 60 * 1000);
				return;
			}
			try {
				var json = JSON.parse(body.substr(1, body.length));
				if (json.actionsuccess) {
					self.named = true;
					self.send('/trn ' + name + ',0,' + json['assertion']);
					self.send(`/user ${name}`);
				} else {
					console.log('Could not log in: ' + JSON.stringify(json), self.id);
				}
			} catch (e) {
				self.named = true;
				self.send('/trn ' + name + ',0,' + body);
				self.send(`/user ${name}`);
			}
		}
    }
    joinRoom(room) {
        if(this.rooms[room]) return; // Ya estaba en la sala
		this.rooms[room] = new Room(room);
        this.send(`/join ${room}`);
    }
    joinAllRooms() {
        if(!roomList[this.id]) return;
        for (let i in roomList[this.id]) {
            for (const room of roomList[this.id][i]) {
                this.joinRoom(room);
            }
        }
	}
}
module.exports = PSBot;