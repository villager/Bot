"use strict";

const util = require('util');
const TEAMS_DATA = './db/teams.json';

module.exports = {
	teams: {},
	staticTeams: {},
	dynTeams: {},

	loadTeamList: function (reloading) {
		try {
			if (reloading) Tools.uncacheTree('./teams.js');
            this.staticTeams = require('./teams.js').teams;
            Tools.FS(TEAMS_DATA).isFile().catch(() =>{
				this.dynTeams = Object.create(null);
				Tools.FS(TEAMS_DATA).writeSync(Tools.FS('./db/teams-example.json').readSync());
            }).then(() =>{
                this.dynTeams = JSON.parse(Tools.FS(TEAMS_DATA).readSync().toString());
            })
			this.mergeTeams();
			return true;
		} catch (e) {
			console.log('failed to load teams: ' + util.inspect(e));
			return false;
		}
	},

	mergeTeams: function () {
		if (this.teams) delete this.teams;
		this.teams = {};
		Object.assign(this.teams, this.staticTeams);
		for (let i in this.dynTeams) {
			let team = this.dynTeams[i];
			if (!this.teams[team.format]) this.teams[team.format] = [];
			this.teams[team.format].push(team.packed);
		}
	},

	addTeam: function (name, format, packed) {
		if (this.dynTeams[name]) return false;
		this.dynTeams[name] = {
			format: format,
			packed: packed
		};
        this.mergeTeams();
        Tools.FS(TEAMS_DATA).writeUpdate(() => JSON.stringify(this.dynTeams));
		return true;
	},

	removeTeam: function (name) {
		if (!this.dynTeams[name]) return false;
		delete this.dynTeams[name];
		this.mergeTeams();
        Tools.FS(TEAMS_DATA).writeUpdate(() => JSON.stringify(this.dynTeams));
		return true;
	},
	getTeam: function (format) {
		let formatId = toId(format);
		let teamStuff = this.teams[formatId];
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
					if (Config.debug.debug) debug("Packed Team: " + JSON.stringify(team));
					teamStr = this.packTeam(team);
				} else if (teamChosen.length){
					//parse team
					teamStr = this.packTeam(teamChosen);
				} else {
					error("invalid team data type: " + JSON.stringify(teamChosen));
					return false;
				}
			} else {
				error("invalid team data type: " + JSON.stringify(teamChosen));
				return false;
			}
			return teamStr;
		} catch (e) {
			error(e.stack);
		}
	},

	hasTeam: function (format) {
		let formatId = toId(format);
		if (this.teams[formatId]) return true;
		return false;
	},

	/* Pack Team function - from Pokemon-Showdown-Client */

	packTeam: function (team) {
		return Tools.packTeam(team);
	}
};