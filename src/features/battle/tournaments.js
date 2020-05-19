"use strict";
/*
	Tournaments parser
*/
const ACTION_INTERVAL = 1500;

let tourData = exports.tourData = {};
let lastAction = exports.lastAction = {};
const TeamBuilder = require('./teambuilder');

function canSendCommands(server, room) {
	let res = true;
	if(!lastAction[server]) lastAction[server] = {};
	if (lastAction[server][room] && Date.now() - lastAction[server][room] < ACTION_INTERVAL) res = false;
	lastAction[server][room] = Date.now();
	return res;	
}
exports.canSendCommands = canSendCommands;
exports.clearData = function(server) {
	for (let i in tourData) {
		delete tourData[server][i];
	}
}
exports.parse = function(server, room, message, isIntro, spl) {
	const Server = server;
	if (spl[0] !== 'tournament') return;
	if (!tourData[Server.id]) tourData[Server.id] = {};
	if (!tourData[Server.id][room]) tourData[Server.id][room] = {};
	switch(spl[1]) {
		case 'update':
			try {
				let data = JSON.parse(spl[2]);
				for (let i in data) {
					tourData[Server.id][room][i] = data[i];
				}
			} catch(e) {}
		break;
		case 'updateEnd':
			let roomData = tourData[Server.id][room];
			if (roomData.format && !roomData.isJoined && !roomData.isStarted) {
				let format = toId(roomData.format);
				if (Server.formats[format] && !Server.formats[format].team) {
					Server.send('/tournament join', room);
				} else {
					if (TeamBuilder.hasTeam(roomData.format)) {
						Server.send('/tournament join', room);
					}
				}
			}
			if (roomData.challenges && roomData.challenges.length) {
				if (canSendCommands(server, room)) {
					let team = TeamBuilder.getTeam(roomData.format);
					if (team) Server.send('/useteam ' + team, room);
					for (let i = 0; i < roomData.challenges.length; i++) Server.send('/tournament challenge ' + tourData[room].challenges[i], room);
				}
			} else if (roomData.challenged) {
				if (canSendCommands(server, room)) {
					let team = TeamBuilder.getTeam(roomData.format);
					if (team) Server.send('/useteam ' + team, room);
					Server.send('/tournament acceptchallenge', room);
				}
			}
		break;
		case 'end':
		case 'forceend':
			delete tourData[Server.id][room];
		break;
		
	}

}