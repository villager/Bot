
exports.reportsRoom = false;

exports.reportBattle = function (room) {
	if (!exports.reportsRoom) return;
	//Bot.say(exports.reportsRoom, Tools.translateGlobal('battle', 'battlefound', lang) + ": <<" + room + ">>");
	exports.reportsRoom = false;
};

exports.laddering = false;
exports.ladderTimer = null;

exports.start = function (format) {
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
		Bot.send(cmds);
	};
	exports.laddering = true;
	exports.ladderTimer = setInterval(check, Config.ladderCheckInterval || (10 * 1000));
	check();
	return true;
};

exports.stop = function () {
	if (!exports.laddering) return false;
	exports.laddering = false;
	if (exports.ladderTimer) clearTimeout(exports.ladderTimer);
	exports.ladderTimer = null;
	return true;
};

exports.destroy = function () {
	exports.laddering = false;
	if (exports.ladderTimer) clearTimeout(exports.ladderTimer);
	exports.ladderTimer = null;
};