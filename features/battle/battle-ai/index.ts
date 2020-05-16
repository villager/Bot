/*
 * Battle manager
 */


const battleAutojoinFile = "./db/" + "battle-autojoin-tmp.json";

import * as BattleFile from './battle';
const Battle = BattleFile.Battle;
export let battles = {};
export let battlesCount = 0;
export let autoJoinData = {};

export function init() {
	for (let i in battles) { 
		for (let x in battles[i]) {
			try {
				battles[i][x].destroy();
			} catch(e) {}
			delete battles[i][x];
		} 
	}
	battlesCount = 0;
}
export function tryJoinAbandonedBattles() {
	if (!Config.abandonedBattleAutojoin) return;
	try {
		autoJoinData = JSON.parse(Tools.FS(battleAutojoinFile).readSync());
	} catch (e) {Monitor.log(e, null, 'Battles');}
	let cmds = [];
	for (let i in autoJoinData) {
		for (let x in autoJoinData[i]) {
			if(!battles[i][x]) {
				cmds.push(`/join ${x}`);
				cmds.push(`/joinbattle ${x}`);

			}
			delete autoJoinData[i][x];
		}
	}
	Tools.FS(battleAutojoinFile).writeUpdate(() => JSON.stringify(this.autoJoinData));
	return cmds;
}
export function updateBattleAutojoin() {
	if (!Config.abandonedBattleAutojoin) return;
	for (let i in autoJoinData) {
		for (let x in autoJoinData[i]) {
			delete autoJoinData[i][x];
		}
	}
	for (let x in battles) {
		for (let i in battles[x]) {
			autoJoinData[x][i] = 1;
		}
	}
	Tools.FS(battleAutojoinFile).writeUpdate(() => JSON.stringify(autoJoinData));

}
export function receive(server:any, room:string, data:any, isIntro:Boolean) {
	if (data.charAt(0) === ">") return;
	let spl = data.substr(1).split("|");
	if (spl[0] === 'init') {
		if(!battles[server.id]) battles[server.id] = {};

		if (battles[server.id][room]) {
			try {
				battles[server.id][room].destroy();
			} catch (e) {}
		}
		battles[server.id][room] = new Battle(server, room);
		battlesCount++;
		updateBattleAutojoin();
	}
	if (battles[server.id][room]) {
		battles[server.id][room].add(data, isIntro);
	}
	if (spl[0] === 'deinit' || spl[0] === 'expire') {
		if (battles[server.id][room]) {
			try {
				battles[server.id][room].destroy();
			} catch (e) {}
			delete battles[server.id][room];
			battlesCount--;
			updateBattleAutojoin();
		}
	}
}
export function destroy() {
	for (let i in battles) {
		for (let x in battles[i]) {
			try {
				battles[i][x].destroy();
			} catch(e) {}
			delete battles[i][x];
		}
	}
}