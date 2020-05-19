"use strict";Object.defineProperty(exports, "__esModule", {value: true});
var _battleai = require('./battle-ai'); var BattleBotPath = _battleai;
 const BattleBot = BattleBotPath; exports.BattleBot = BattleBot;

var _teambuilder = require('./teambuilder'); var TeamBuilderPath = _teambuilder;
 const TeamBuilder = TeamBuilderPath; exports.TeamBuilder = TeamBuilder;

 function reportBattle (server, room) {
	if (!server.reportsRoom) return;
	//Bot.say(exports.reportsRoom, Tools.translateGlobal('battle', 'battlefound', lang) + ": <<" + room + ">>");
	server.reportsRoom = false;
} exports.reportBattle = reportBattle;

 let laddering = false; exports.laddering = laddering;
 let ladderTimer = null; exports.ladderTimer = ladderTimer;

 function start (server ,format) {
	if (!format) return false;
	if (exports.laddering) return false;
	format = toId(format);
	let check = function () {
		let counter = 0;
		let maxBattles = 1;
		if (Config.ladderNumberOfBattles && Config.ladderNumberOfBattles > 0) maxBattles = Config.ladderNumberOfBattles;
		for (let i in exports.BattleBot.battles) {
			if (exports.BattleBot.battles[i].tier && toId(exports.BattleBot.battles[i].tier) === format && exports.BattleBot.battles[i].rated) counter++;
		}
		if (counter >= maxBattles) return;
		let cmds = [];
		let team = exports.TeamBuilder.getTeam(format);
		if (team) cmds.push('|/useteam ' + team);
		cmds.push('|/search ' + format);
		server.send(cmds);
	};
	exports.laddering = true;
	exports.ladderTimer = setInterval(check, Config.ladderCheckInterval || (10 * 1000));
	check();
	return true;
} exports.start = start;

 function stop () {
	if (!exports.laddering) return false;
	exports.laddering = false;
	if (exports.ladderTimer) clearTimeout(exports.ladderTimer);
	exports.ladderTimer = null;
	return true;
} exports.stop = stop;

 function destroy () {
	exports.laddering = false;
	if (exports.ladderTimer) clearTimeout(exports.ladderTimer);
	exports.ladderTimer = null;
} exports.destroy = destroy;