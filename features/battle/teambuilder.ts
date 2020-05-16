import * as util from 'util';

const TEAMS_DATA = './db/teams.json';
export let teams = {};
export let staticTeams = {};
export let dynTeams = {};
export function mergeTeams () {
	if (teams) teams = {};
	Object.assign(teams, staticTeams);
	for (let i in dynTeams) {
		let team = dynTeams[i];
		if (!teams[team.format]) teams[team.format] = [];
		teams[team.format].push(team.packed);
	}
}
export function addTeam (name:any, format:any, packed:any) {
	if (dynTeams[name]) return false;
	dynTeams[name] = {
		format: format,
		packed: packed
	};
	mergeTeams();
	Tools.FS(TEAMS_DATA).writeUpdate(() => JSON.stringify(dynTeams));
	return true;
}
export function loadTeamList(reloading:Boolean) {
	try {
		//if (reloading) Tools.uncacheTree('../features/battle/teams.js');
		staticTeams = require('./teams.js').teams;
		Tools.FS(TEAMS_DATA).isFile().catch(() =>{
			dynTeams = Object.create(null);
			Tools.FS(TEAMS_DATA).writeSync(Tools.FS('./db/teams-example.json').readSync());
		}).then(() =>{
			dynTeams = JSON.parse(Tools.FS(TEAMS_DATA).readSync().toString());
		})
		mergeTeams();
		return true;
	} catch (e) {
		console.log('failed to load teams: ' + util.inspect(e));
		return false;
	}	
}
export function removeTeam (name:any) {
	if (!dynTeams[name]) return false;
	delete dynTeams[name];
	mergeTeams();
	Tools.FS(TEAMS_DATA).writeUpdate(() => JSON.stringify(dynTeams));
	return true;
}
export function getTeam (format:any) {
	let formatId = toId(format);
	let teamStuff = teams[formatId];
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
}
export function	hasTeam (format: string) {
	let formatId = toId(format);
	if (teams[formatId]) return true;
	return false;
}

/* Pack Team function - from Pokemon-Showdown-Client */

export function packTeam (team:any) {
	return Tools.packTeam(team);
}