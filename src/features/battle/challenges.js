"use strict";Object.defineProperty(exports, "__esModule", {value: true}); let challenges = {}; exports.challenges = challenges;
var _teambuilder = require('./teambuilder'); var TeamBuilderPath = _teambuilder;
const TeamBuilder = TeamBuilderPath;

var _battleai = require('./battle-ai'); var BattleBotPath = _battleai;
const BattleBot = BattleBotPath;


function canChallenge(server, i, nBattles) {
	if (!nBattles) return true; //If it is not busy, accept the challenge
	if (Config.aceptAll) return true; //Acept all challenges if 'aceptAll' is enabled
	if (Config.maxBattles && Config.maxBattles > nBattles) return true; //If it is not in too many battles, accept the challenge
	//if (Tools.equalOrHigherRank(i, Tools.getGroup('driver'))) return true; //Staff exception
	return false;
}

 function parse (server, room, message, isIntro, spl) {
	const Server = server; 
	if (spl[0] !== 'updatechallenges') return;
	let nBattles = Object.keys(BattleBot.battles).length;
	try {
		exports.challenges = JSON.parse(message.substr(18));
	} catch (e) {return;}
	if (exports.challenges.challengesFrom) {
		for (let i in exports.challenges.challengesFrom) {
			if (canChallenge(server, i, nBattles)) {
				let format = exports.challenges.challengesFrom[i];
				if (!(format in Server.formats) || !Server.formats[format].chall) {
					Server.send('/reject ' + i);
					continue;
				}
				if (Server.formats[format].team && !TeamBuilder.hasTeam(format)) {
					Server.send('', '/reject ' + i);
					continue;
				}

				var team = TeamBuilder.getTeam(format);
				if (team) {
					Server.send('/useteam ' + team);
				}
				Server.send('/accept ' + i);
				nBattles++;
			} else {
				Server.send('/reject ' + i);
				//debug("rejected battle: " + i + " | " + exports.challenges.challengesFrom[i]);
				continue;
			}
		}
	}
} exports.parse = parse;