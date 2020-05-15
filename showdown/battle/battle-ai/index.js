/*
 * Battle manager
 */

 "use strict";
const battleAutojoinFile = "./db/" + "battle-autojoin-tmp.json";

let Battle = require('./battle.js').Battle;

module.exports = {
	battles: {},
	battlesCount: 0,

	init: function () {
		for (var room in this.battles) {
			try {
				this.battles[room].destroy();
			} catch (e) {}
			delete this.battles[room];
		}
		this.battlesCount = 0;
	},

	autoJoinData: {},

	tryJoinAbandonedBattles: function () {
		if (!Config.abandonedBattleAutojoin) return;
		try {
			this.autoJoinData = JSON.parse(Tools.FS(battleAutojoinFile).readSync());
		} catch (e) {Monitor.log(e, null, 'Battles');}
		var cmds = [];
		for (var i in this.autoJoinData) {
			if (!this.battles[i]) {
				cmds.push('|/join ' + i);
				cmds.push(i + '|/joinbattle');
			}
			delete this.autoJoinData[i];
        }
        Tools.FS(battleAutojoinFile).writeUpdate(() => JSON.stringify(this.autoJoinData));
		return cmds;
	},

	updateBattleAutojoin: function () {
		if (!Config.abandonedBattleAutojoin) return;
		for (var i in this.autoJoinData) {
			delete this.autoJoinData[i];
		}
		for (var room in this.battles) {
			this.autoJoinData[room] = 1;
        }
        Tools.FS(battleAutojoinFile).writeUpdate(() => JSON.stringify(this.autoJoinData));

	},

	receive: function (server, room, data, isIntro) {
		if (data.charAt(0) === ">") return;
		let spl = data.substr(1).split("|");
		if (spl[0] === 'init') {
			if (this.battles[room]) {
				try {
					this.battles[room].destroy();
				} catch (e) {}
			}
			this.battles[room] = new Battle(server, room);
			this.battlesCount++;
			this.updateBattleAutojoin();
		}
		if (this.battles[room]) {
			this.battles[room].add(data, isIntro);
		}
		if (spl[0] === 'deinit' || spl[0] === 'expire') {
			if (this.battles[room]) {
				try {
					this.battles[room].destroy();
				} catch (e) {}
				delete this.battles[room];
				this.battlesCount--;
				this.updateBattleAutojoin();
			}
		}
	},

	destroy: function () {
		for (var room in this.battles) {
			try {
				this.battles[room].destroy();
			} catch (e) {}
			delete this.battles[room];
			this.battlesCount--;
		}
	}
};