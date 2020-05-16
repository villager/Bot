
import * as BattleBotPath from './battle-ai';
export const BattleBot = BattleBotPath;

import * as TeamBuilderPath from './teambuilder';
export const TeamBuilder = TeamBuilderPath;

export function reportBattle (server, room) {
	if (!server.reportsRoom) return;
	//Bot.say(exports.reportsRoom, Tools.translateGlobal('battle', 'battlefound', lang) + ": <<" + room + ">>");
	server.reportsRoom = false;
}

export let laddering = false;
export let ladderTimer = null;

export function start (server: any ,format:any) {
	if (!format) return false;
	if (exports.laddering) return false;
	format = toId(format);
	let check = function () {
		let counter = 0;
		let maxBattles = 1;
		if (Config.ladderNumberOfBattles && Config.ladderNumberOfBattles > 0) maxBattles = Config.ladderNumberOfBattles;
		for (let i in BattleBot.battles) {
			if (BattleBot.battles[i].tier && toId(BattleBot.battles[i].tier) === format && BattleBot.battles[i].rated) counter++;
		}
		if (counter >= maxBattles) return;
		let cmds = [];
		let team = TeamBuilder.getTeam(format);
		if (team) cmds.push('|/useteam ' + team);
		cmds.push('|/search ' + format);
		server.send(cmds);
	};
	laddering = true;
	ladderTimer = setInterval(check, Config.ladderCheckInterval || (10 * 1000));
	check();
	return true;
}

export function stop () {
	if (!laddering) return false;
	laddering = false;
	if (ladderTimer) clearTimeout(exports.ladderTimer);
	ladderTimer = null;
	return true;
}

export function destroy () {
	laddering = false;
	if (exports.ladderTimer) clearTimeout(exports.ladderTimer);
	ladderTimer = null;
}