/*
	Tournaments parser
*/
"use strict";
const ACTION_INTERVAL = 1500;

let tourData = exports.tourData = {};
let lastAction = exports.lastAction = {};
const TeamBuilder = require('./teambuilder');

let canSendCommands = exports.canSendCommands = function (room) {
	var res = true;
	if (lastAction[room] && Date.now() - lastAction[room] < ACTION_INTERVAL) res = false;
	lastAction[room] = Date.now();
	return res;
};

exports.clearData = function () {
	for (let i in tourData)
		delete tourData[i];
};

exports.parse = function (server, room, message, spl) {
	const Server = Servers[server];
	if (spl[0] !== 'tournament') return;
	if (!tourData[room]) tourData[room] = {};
	switch (spl[1]) {
		case 'update':
			try {
				var data = JSON.parse(spl[2]);
				for (var i in data)
					tourData[room][i] = data[i];
			} catch (e){}
			break;
		case 'updateEnd':
			if (tourData[room].format && !tourData[room].isJoined && !tourData[room].isStarted) {
				var format = toId(tourData[room].format);
				if (Server.formats[format] && !Server.formats[format].team) {
					Server.send('/tournament join', room);
				} else {
					if (TeamBuilder.hasTeam(tourData[room].format)) Server.send('/tournament join', room);
				}
			}
			if (tourData[room].challenges && tourData[room].challenges.length) {
				if (canSendCommands(room)) {
					var team = TeamBuilder.getTeam(tourData[room].format);
					if (team) Server.send('/useteam ' + team, room);
					for (var i = 0; i < tourData[room].challenges.length; i++) Server.send('/tournament challenge ' + tourData[room].challenges[i], room);
				}
			} else if (tourData[room].challenged) {
				if (canSendCommands(room)) {
					var team = TeamBuilder.getTeam(tourData[room].format);
					if (team) Server.send('/useteam ' + team, room);
					Server.send('/tournament acceptchallenge', send);
				}
			}
			break;
		case 'end':
		case 'forceend':
			delete tourData[room];
			break;
	}
};