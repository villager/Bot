"use strict";Object.defineProperty(exports, "__esModule", {value: true});var _util = require('util'); var util = _util;

const TEAMS_DATA = '../src/features/battle/data/teams.json';
 let teams = {}; exports.teams = teams;
 let staticTeams = {}; exports.staticTeams = staticTeams;
 let dynTeams = {}; exports.dynTeams = dynTeams;
 function mergeTeams () {
	if (exports.teams) exports.teams = {};
	Object.assign(exports.teams, exports.staticTeams);
	for (let i in exports.dynTeams) {
		let team = exports.dynTeams[i];
		if (!exports.teams[team.format]) exports.teams[team.format] = [];
		exports.teams[team.format].push(team.packed);
	}
} exports.mergeTeams = mergeTeams;
 function addTeam (name, format, packed) {
	if (exports.dynTeams[name]) return false;
	exports.dynTeams[name] = {
		format: format,
		packed: packed
	};
	mergeTeams();
	Tools.FS(TEAMS_DATA).writeUpdate(() => JSON.stringify(exports.dynTeams));
	return true;
} exports.addTeam = addTeam;
 function loadTeamList(reloading) {
	try {
		//if (reloading) Tools.uncacheTree('../features/battle/teams.js');
		exports.dynTeams = JSON.parse(Tools.FS(TEAMS_DATA).readSync().toString());
		mergeTeams();
		return true;
	} catch (e) {
		console.log('failed to load teams: ' + util.inspect(e));
		return false;
	}	
} exports.loadTeamList = loadTeamList;
 function removeTeam (name) {
	if (!exports.dynTeams[name]) return false;
	delete exports.dynTeams[name];
	mergeTeams();
	Tools.FS(TEAMS_DATA).writeUpdate(() => JSON.stringify(exports.dynTeams));
	return true;
} exports.removeTeam = removeTeam;
 function getTeam (format) {
	let formatId = toId(format);
	let teamStuff = exports.teams[formatId];
	if (!teamStuff || !teamStuff.length) return false;
	let teamChosen = teamStuff[Math.floor(Math.random() * teamStuff.length)]; //choose team
	let teamStr = '';
	try {
		if (typeof teamChosen === 'string') {
			//already parsed
			teamStr = teamChosen;
		} else if (typeof teamChosen === 'object') {
			if (teamChosen.maxPokemon && teamChosen.pokemon) {
				//generate random team
				let team = [];
				let pokes = teamChosen.pokemon.randomize();
				let k = 0;
				for (let i = 0; i < pokes.length; i++) {
					if (k++ >= teamChosen.maxPokemon) break;
					team.push(pokes[i]);
				}
				if (Config.debug.debug) console.log("Packed Team: " + JSON.stringify(team));
				teamStr = packTeam(team);
			} else if (teamChosen.length){
				//parse team
				teamStr = packTeam(teamChosen);
			} else {
				console.log("invalid team data type: " + JSON.stringify(teamChosen));
				return false;
			}
		} else {
			console.log("invalid team data type: " + JSON.stringify(teamChosen));
			return false;
		}
		return teamStr;
	} catch (e) {
		console.log(e.stack);
	}
} exports.getTeam = getTeam;
 function	hasTeam (format) {
	let formatId = toId(format);
	if (exports.teams[formatId]) return true;
	return false;
} exports.hasTeam = hasTeam;

/* Pack Team function - from Pokemon-Showdown-Client */

 function packTeam (team) {
	return Tools.packTeam(team);
} exports.packTeam = packTeam;