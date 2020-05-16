/*
	Tournaments Manager Feature
*/

export const id = 'tours';

export let tournaments = {};
export let tourData = {};

import * as LeaderboardsPath from './leaderboards'; 
export const Leaderboards = LeaderboardsPath;

class Tournament {
    format: string;
    type: string;
    users: number;
    maxUsers: number;
    signups: Boolean;
    started:Boolean;
    startTimer: any;
    room: string;
    timeToStart: number;
    autoDq: Boolean;
    scoutProtect: Boolean;
    server: any;
    constructor(server, room:string, details:any) {
		this.format = details.format || 'randombattle';
		this.type = details.type || 'elimination';
		this.users = 0;
		this.maxUsers = details.maxUsers || null;
		this.signups = false;
		this.started = false;
		this.startTimer = null;
		this.room = room || 'lobby';
		this.timeToStart = details.timeToStart || 30 * 1000;
		this.autoDq = details.autodq || false;
        this.scoutProtect = details.scoutProtect || false;
        this.server = server;
    }
    send(data: string) {
        this.server.send(data, this.room);
    }
    createTour() {
        this.send(`/tournament create ${this.format}, ${this.type}`);
        this.signups = true;
    }
    startTimeout() {
        if(!this.timeToStart) return;
        this.signups = true;
        if(this.scoutProtect) this.send('/tournament setscouting disallow'); // WTF
        this.startTimer = setTimeout(() => {
            this.startTour();
            this.started = true;
            this.startTimer = null;
        }, this.timeToStart);
    }
    startTour() {
        this.signups = false;
        this.send('/tournament start');
    }
    checkUsers() {
        if(!this.maxUsers) return;
        if(this.maxUsers <= this.users) this.startTour();
    }
    setAutodq() {
        if(!this.autoDq) return;
        this.send(`/tournament autodq ${this.autoDq}`);
    }
    endTour() {

    }
}
export function newTour(server, room, details) {
    if(!tournaments[server.id]) tournaments[server.id] = {};
    tournaments[server.id][room] = new Tournament(server, room, details);
    tournaments[server.id][room].createTour();
}
export function init () {
    for (let i in tournaments) {
        for (let x in tournaments[i]) {
            if(tournaments[i][x].startTimer) clearTimeout(tournaments[i][x].startTimer);
            delete tournaments[i][x];
        }
    }
    for (let i in tourData) {
        for (let x in tourData) {
            delete tourData[i][x];
        }
    }
    Leaderboards.load();
}

export function parse (server:any, room: string, message:any, isIntro:Boolean, spl:any) {
	if (spl[0] !== 'tournament') return;
    if (isIntro) return;
    if(!tourData[server.id]) tourData[server.id] = {};
    if(!tourData[server.id][room]) tourData[server.id][room] = {};
    if (!tourData[room]) tourData[room] = {};
    let tourRoom = tournaments[server.id][room];
	switch (spl[1]) {
		case 'create':
			if (!tourRoom) break;
			tourRoom.startTimeout();
			break;
		case 'join':
			if (!tourRoom) break;
			tourRoom.users++;
			tourRoom.checkUsers();
			break;
		case 'leave':
			if (!tourRoom) break;
			tourRoom.users--;
			tourRoom.checkUsers();
			break;
		case 'start':
			if (!tourRoom) break;
			if (tourRoom.signups) {
				clearTimeout(tourRoom.startTimer);
				tourRoom.setAutodq();
			}
			break;
		case 'update':
			try {
                let data = JSON.parse(spl[2]);                
				for (let i in data)
					tourData[server.id][room][i] = data[i];
			} catch (e){}
			break;
		case 'updateEnd':
			if (!tourRoom) break;
			if (tourRoom.started && !tourRoom.isStarted) {
				tourRoom.startTour();
			}
			break;
		case 'end':
			try {
				var data = JSON.parse(spl[2]);
				for (let i in data)
					tourData[server.id][room][i] = data[i];
            } catch (e){}
            
			Leaderboards.onTournamentEnd(server, room, tourData[server.id][room]);
			delete tourData[server.id][room];
			if (tourRoom && tourRoom.startTimer) clearTimeout(tourRoom.startTimer);
			if (tourRoom) delete tournaments[server.id][room];
			break;
		case 'forceend':
			delete tourData[server.id][room];
			if (tourRoom && tourRoom.startTimer) clearTimeout(tourRoom.startTimer);
			if (tournaments[server.id][room]) delete tournaments[server.id][room];
			break;
	}
}
export const commands = {
	tourhelp: function (target, room, user) {
        this.replyTrad('msg');
	},
    tourstart: 'tourend',
	tourend: function (target:string, room:string, user:string) {
	//	if (this.roomType !== 'chat' || !this.can('tournament')) return;
		if (!tourData[this.serverid][room]) return this.replyTrad('err');
		if (this.cmd === 'tourstart' && !tourData[this.serverid][room].signups) return this.replyTrad('err2');
        this.sendReply("/tournament " + (this.cmd === 'tourend' ? 'end' : 'start'));
    },
	maketour: 'tournament',
	newtour: 'tournament',
	tour: 'tournament',
	tournament: function (target, room, user) {
        //if (this.roomType !== 'chat' || !this.can('tournament')) return;
        if (!tourData[this.serverid]) tourData[this.serverid] = {};
		if (tourData[this.serverid][room]) {
			if (toId(target) === 'end') return this.runCmd('tourend');
			if (toId(target) === 'start') return this.runCmd('tourstart');
			return this.replyTrad('e2');
		}
		let details:any = {
			format: 'ou',
			type: 'elimination',
			maxUsers: null,
			timeToStart: 30 * 1000,
			autodq: 1.5
		};
		if (typeof Config.tourDefault === 'object') {
			for (let i in Config.tourDefault) {
				details[i] = Config.tourDefault[i];
			}
		}
		if (target) {
            target = splint(target);
			let params = {
				format: null,
				type: null,
				maxUsers: null,
				timeToStart: null,
				autodq: null,
				scout: null
			};
			let splArg;
			for (var i = 0; i < target.length; i++) {
				if (!target[i]) continue;
				splArg = target[i].split("=");
				if (splArg.length < 2) {
					switch (i) {
						case 0:
							params.format = target[i];
							break;
						case 1:
							params.timeToStart = target[i];
							break;
						case 2:
							params.autodq = target[i];
							break;
						case 3:
							params.maxUsers = target[i];
							break;
						case 4:
							params.type = target[i];
							break;
					}
				} else {
					let idArg = toId(splArg[0]);
					let valueArg = splArg[1].trim();
					switch (idArg) {
						case 'format':
						case 'tier':
							params.format = valueArg;
							break;
						case 'time':
						case 'singups':
						case 'timer':
							params.timeToStart = valueArg;
							break;
						case 'autodq':
						case 'dq':
							params.autodq = valueArg;
							break;
						case 'maxusers':
						case 'users':
							params.maxUsers = valueArg;
							break;
						case 'generator':
						case 'type':
							params.type = valueArg;
							break;
						case 'scouting':
						case 'scout':
						case 'setscout':
						case 'setscouting':
							params.scout = valueArg;
							break;
						default:
                            return this.replyTrad('paramerror', idArg, ' tier, timer, dq, users, type, scout');
					}
				}
			}
			if (params.format) {
				var format = Tools.parseAliases(params.format);
				if (!this.bot.formats[format] || !this.bot.formats[format].chall) return this.replyTrad('invalid_format', format);
				details.format = format;
			}
			if (params.timeToStart) {
				if (toId(params.timeToStart) === 'off') {
					details.timeToStart = null;
				} else {
					var time = parseInt(params.timeToStart);
					if (!time || time < 10) return this.replyTrad('e4');
					details.timeToStart = time * 1000;
				}
			}
			if (params.autodq) {
				if (toId(params.autodq) === 'off') {
					details.autodq = false;
				} else {
					var dq = parseFloat(params.autodq);
					if (!dq || dq < 0) return this.replyTrad('e5');
					details.autodq = dq;
				}
			}
			if (params.maxUsers) {
				if (toId(params.maxUsers) === 'off') {
					details.maxUsers = null;
				} else {
					var musers = parseInt(params.maxUsers);
					if (!musers || musers < 4) return this.replyTrad('e6');
					details.maxUsers = musers;
				}
			}
			if (params.type) {
				var type = toId(params.type);
				if (type !== 'elimination' && type !== 'roundrobin') return this.replyTrad('e7');
				details.type = type;
			}
			if (params.scout) {
				var scout = toId(params.scout);
				if (scout in {'yes': 1, 'on': 1, 'true': 1, 'allow': 1, 'allowed': 1})  details.scoutProtect = false;
				else details.scoutProtect = true;
			}
		}
		newTour(this.bot, room, details);
		setTimeout(() => {
			if (tournaments[this.serverid][room] && !tourData[this.serverid][room]) {
                this.replyTrad('notstarted');
				delete tournaments[this.serverid][room];
			}
		}, 2500);
    },   
	unofficial: 'official',
	official: function (target, room, user) {
		//if (!this.can("official")) return;
		if (!Leaderboards.isConfigured(this.serverid, room)) return this.replyTrad('not', room);
		if (!tourData[this.serverid][room]) return this.replyTrad("notour");
		if (this.cmd === "unofficial") {
			if (!tourData[this.serverid][room].isOfficialTour) return this.replyTrad("already-not");
			tourData[this.serverid][room].isOfficialTour = false;
			this.replyTrad("unofficial");
		} else {
			if (tourData[this.serverid][room].isOfficialTour) return this.replyTrad("already");
			tourData[room][this.serverid].isOfficialTour = true;
			this.replyTrad("official");
		}
    },
    /*
	rank: 'leaderboard',
	ranking: 'leaderboard',
	top: 'leaderboard',
	leaderboards: 'leaderboard',
	leaderboard: function (arg, by, room, cmd) {
		var args = arg.split(",");
		var opt = cmd;
		var tarRoom;
		if (cmd in {leaderboards: 1, leaderboard: 1}) {
			opt = toId(args.shift());
			cmd += " " + opt + ",";
		}
		switch (opt) {
			case "rank":
			case "ranking":
				tarRoom = room;
				if (this.roomType !== "chat") tarRoom = toRoomid(args.shift());
				if (args.length > 1) tarRoom = toRoomid(args.shift());
				if (!tarRoom) return this.restrictReply(this.trad('usage') + ": " + this.cmdToken + cmd + " [room], [user]", "rank");
				if (!Features['tours'].Leaderboards.isConfigured(tarRoom)) return this.restrictReply(this.trad('not') + " " + tarRoom, "rank");
				var target = toId(args[0] || by);
				if (target.length > 18) return this.restrictReply(this.trad('invuser'));
				var rank = Features['tours'].Leaderboards.getPoints(tarRoom, target);
				var txt = this.trad('rank') + " **" + Tools.toName(rank.name) + "** " + this.trad('in') + " __" + Tools.toName(tryGetRoomName(tarRoom)) + "__ | ";
				txt += this.trad('points') + ": " + rank.points + " | ";
				txt += this.trad('w') + ": " + rank.wins + " " + this.trad('times') + ", " + this.trad('f') + ": " + rank.finals + " " + this.trad('times') + ", " + this.trad('sf') + ": " + rank.semis + " " + this.trad('times') + ". ";
				txt += this.trad('total') + ": " + rank.tours + " " + this.trad('tours') + ", " + rank.battles + " " + this.trad('bwon') + ".";
				this.restrictReply(txt, "rank");
				break;
			case "top":
				if (args.length > 0) tarRoom = toRoomid(args[0]);
				if (!tarRoom && this.roomType === "chat") tarRoom = room;
				if (!tarRoom) return this.restrictReply(this.trad('usage') + ": " + this.cmdToken + cmd + " [room]", "rank");
				if (!Features['tours'].Leaderboards.isConfigured(tarRoom)) return this.restrictReply(this.trad('not') + " " + tarRoom, "rank");
				var top = Features['tours'].Leaderboards.getTop(tarRoom);
				if (!top || !top.length) return this.restrictReply(this.trad('empty') + " " + tarRoom, "rank");
				var topResults = [];
				for (var i = 0; i < 5 && i < top.length; i++) {
					topResults.push("__#" + (i + 1) + "__ **" + Tools.toName(top[i][0]) + "** (" + top[i][6] + ")");
				}
				this.restrictReply("**" + Tools.toName(tryGetRoomName(tarRoom)) + "** | " + topResults.join(", "), "rank");
				break;
			case "table":
				if (!this.isRanked('roomowner')) return false;
				if (args.length > 0) tarRoom = toRoomid(args[0]);
				if (!tarRoom && this.roomType === "chat") tarRoom = room;
				if (!tarRoom) return this.reply(this.trad('usage') + ": " + this.cmdToken + cmd + " [room]");
				if (!Features['tours'].Leaderboards.isConfigured(tarRoom)) return this.reply(this.trad('not') + " " + tarRoom);
				var size = args[1] ? parseInt(args[1]) : 100;
				if (!size || size < 0) return this.reply(this.trad('usage') + ": " + this.cmdToken + cmd + " [room], [size]");
				var table = Features['tours'].Leaderboards.getTable(tarRoom, size);
				if (!table) return this.reply(this.trad('empty') + " " + tarRoom);
				Tools.uploadToHastebin(table, function (r, link) {
					if (r) return this.pmReply(this.trad('table') + " ("  + tarRoom + '): ' + link);
					else this.pmReply(this.trad('err'));
				}.bind(this));
				break;
			case "reset":
				if (!this.isExcepted) return false;
				if (args.length < 1 || !toId(args[0])) return this.reply(this.trad('usage') + ": " + this.cmdToken + cmd + " [room]");
				tarRoom = toRoomid(args[0]);
				var code = Features['tours'].Leaderboards.getResetHashCode(tarRoom);
				if (!code) return this.reply(this.trad('empty') + " " + tarRoom);
				this.reply(this.trad('use') + " ``" + this.cmdToken + this.handler + " confirmreset, " + code + "`` " + this.trad('confirm') + " " + room);
				break;
			case "confirmreset":
				if (!this.isExcepted) return false;
				if (args.length < 1 || !toId(args[0])) return this.reply(this.trad('usage') + ": " + this.cmdToken + cmd + " [hashcode]");
				var _code = args[0].trim();
				var r =  Features['tours'].Leaderboards.execResetHashCode(_code);
				if (!r) return this.reply(this.trad('invhash'));
				this.sclog();
				this.reply(this.trad('data') + " __" + r + "__ " + this.trad('del'));
				break;
			case "viewconfig":
				if (!this.isExcepted) return false;
				if (args.length < 1 || !toId(args[0])) return this.reply(this.trad('usage') + ": " + this.cmdToken + cmd + " [room]");
				tarRoom = toRoomid(args[0]);
				var rConf = Features['tours'].Leaderboards.getConfig(tarRoom);
				if (Config.leaderboards && Config.leaderboards[tarRoom]) {
					this.reply("Room: " + tarRoom + " | ``config.js`` - static | " +
							   "W: " + rConf.winnerPoints + ", F: " + rConf.finalistPoints +
							   ", SF: " + rConf.semiFinalistPoints + ", B: " + rConf.battlePoints +
							   (rConf.onlyOfficial ? " | Only official tours" : ""));
				} else if (Settings.settings.leaderboards && Settings.settings.leaderboards[tarRoom]) {
					this.reply("Room: " + tarRoom + " | " +
							   "W: " + rConf.winnerPoints + ", F: " + rConf.finalistPoints +
							   ", SF: " + rConf.semiFinalistPoints + ", B: " + rConf.battlePoints +
							   (rConf.onlyOfficial ? " | Only official tours" : ""));
				} else {
					this.reply(this.trad('not') + " " + tarRoom);
				}
				break;
			case "setconfig":
				if (!this.isExcepted) return false;
				if (!Settings.settings.leaderboards) Settings.settings.leaderboards = {};
				if (args.length < 2 || !toId(args[0])) return this.reply(this.trad('usage') + ": " + this.cmdToken + cmd + " [room], [on/off], [W], [F], [SF], [B], [official/all]");
				if (args[6] && toId(args[6]) !== "official" && toId(args[6]) !== "all") return this.reply(this.trad('usage') + ": " + this.cmdToken + cmd + " [room], [on/off], [W], [F], [SF], [B], [official/all]");
				tarRoom = toRoomid(args[0]);
				var enabled = toId(args[1]);
				var rConfAux = Features['tours'].Leaderboards.getConfig(tarRoom);
				if (enabled in {on: 1, enabled: 1}) {
					if (args[2]) rConfAux.winnerPoints = parseInt(args[2]);
					if (args[3]) rConfAux.finalistPoints = parseInt(args[3]);
					if (args[4]) rConfAux.semiFinalistPoints = parseInt(args[4]);
					if (args[5]) rConfAux.battlePoints = parseInt(args[5]);
					if (args[6]) {
						switch (toId(args[6])) {
							case "official":
								rConfAux.onlyOfficial = true;
								break;
							case "all":
								rConfAux.onlyOfficial = false;
								break;
						}
					}
					this.sclog();
					Settings.settings.leaderboards[tarRoom] = rConfAux;
					Settings.save();
					this.reply(this.trad('wasset') + " " + tarRoom);
				} else if (enabled in {off: 1, disabled: 1}) {
					if (Settings.settings.leaderboards && Settings.settings.leaderboards[tarRoom]) {
						this.sclog();
						delete Settings.settings.leaderboards[tarRoom];
						Settings.save();
						this.reply(this.trad('wasdisabled') + " " + tarRoom);
					} else {
						this.reply(this.trad('alrdisabled') + " " + tarRoom);
					}
				} else {
					return this.reply(this.trad('usage') + ": " + this.cmdToken + cmd + " [room], [on/off], [W], [F], [SF], [B], [official/all]");
				}
				break;
			default:
				this.restrictReply(this.trad('unknown') + ". " + this.trad('usage') + ": " + this.cmdToken + this.handler + " [rank/top/table/reset/setconfig/viewconfig]", "rank");
		}
	} */
};