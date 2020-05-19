"use strict";Object.defineProperty(exports, "__esModule", {value: true});/*
 * Battle manager
 */


const battleAutojoinFile = "./db/" + "battle-autojoin-tmp.json";

var _battle = require('./battle'); var BattleFile = _battle;
const Battle = BattleFile.Battle;
 let battles = {}; exports.battles = battles;
 let battlesCount = 0; exports.battlesCount = battlesCount;
 let autoJoinData = {}; exports.autoJoinData = autoJoinData;

 function init() {
	for (let i in exports.battles) { 
		for (let x in exports.battles[i]) {
			try {
				exports.battles[i][x].destroy();
			} catch(e) {}
			delete exports.battles[i][x];
		} 
	}
	exports.battlesCount = 0;
} exports.init = init;
 function tryJoinAbandonedBattles() {
	if (!Config.abandonedBattleAutojoin) return;
	try {
		exports.autoJoinData = JSON.parse(Tools.FS(battleAutojoinFile).readSync());
	} catch (e) {Monitor.log(e, null, 'Battles');}
	let cmds = [];
	for (let i in exports.autoJoinData) {
		for (let x in exports.autoJoinData[i]) {
			if(!exports.battles[i][x]) {
				cmds.push(`/join ${x}`);
				cmds.push(`/joinbattle ${x}`);

			}
			delete exports.autoJoinData[i][x];
		}
	}
	Tools.FS(battleAutojoinFile).writeUpdate(() => JSON.stringify(this.autoJoinData));
	return cmds;
} exports.tryJoinAbandonedBattles = tryJoinAbandonedBattles;
 function updateBattleAutojoin() {
	if (!Config.abandonedBattleAutojoin) return;
	for (let i in exports.autoJoinData) {
		for (let x in exports.autoJoinData[i]) {
			delete exports.autoJoinData[i][x];
		}
	}
	for (let x in exports.battles) {
		for (let i in exports.battles[x]) {
			exports.autoJoinData[x][i] = 1;
		}
	}
	Tools.FS(battleAutojoinFile).writeUpdate(() => JSON.stringify(exports.autoJoinData));

} exports.updateBattleAutojoin = updateBattleAutojoin;
 function receive(server, room, data, isIntro) {
	if (data.charAt(0) === ">") return;
	let spl = data.substr(1).split("|");
	if (spl[0] === 'init') {
		if(!exports.battles[server.id]) exports.battles[server.id] = {};

		if (exports.battles[server.id][room]) {
			try {
				exports.battles[server.id][room].destroy();
			} catch (e) {}
		}
		exports.battles[server.id][room] = new Battle(server, room);
		exports.battlesCount++;
		updateBattleAutojoin();
	}
	if (exports.battles[server.id][room]) {
		exports.battles[server.id][room].add(data, isIntro);
	}
	if (spl[0] === 'deinit' || spl[0] === 'expire') {
		if (exports.battles[server.id][room]) {
			try {
				exports.battles[server.id][room].destroy();
			} catch (e) {}
			delete exports.battles[server.id][room];
			exports.battlesCount--;
			updateBattleAutojoin();
		}
	}
} exports.receive = receive;
 function destroy() {
	for (let i in exports.battles) {
		for (let x in exports.battles[i]) {
			try {
				exports.battles[i][x].destroy();
			} catch(e) {}
			delete exports.battles[i][x];
		}
	}
} exports.destroy = destroy;