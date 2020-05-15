
let challenges = exports.challenges = {};
const TeamBuilder = require('./teambuilder');
const BattleBot = require('./battle-ai');

function canChallenge(i, nBattles) {
	if (!nBattles) return true; //If it is not busy, accept the challenge
	if (Config.aceptAll) return true; //Acept all challenges if 'aceptAll' is enabled
	if (Config.maxBattles && Config.maxBattles > nBattles) return true; //If it is not in too many battles, accept the challenge
	//if (Tools.equalOrHigherRank(i, Tools.getGroup('driver'))) return true; //Staff exception
	return false;
}

exports.parse = function (server, room, message, isIntro, spl) {
	const Server = server; 
	if (spl[0] !== 'updatechallenges') return;
	let nBattles = Object.keys(BattleBot.battles).length;
	try {
		challenges = JSON.parse(message.substr(18));
	} catch (e) {return;}
	if (challenges.challengesFrom) {
		for (let i in challenges.challengesFrom) {
			if (canChallenge(i, nBattles)) {
				let format = challenges.challengesFrom[i];
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
};