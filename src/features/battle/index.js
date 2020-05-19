"use strict";

const BattleBot = require('./battle-ai');
const TeamBuilder = require('./teambuilder');
const ChallManager = require('./challenges');
const TourManager = require('./tournaments');
const LadderManager = require('./ladder');

exports.key = 'showdown';

exports.init = function (server) {
	BattleBot.init();
	TourManager.clearData(server);
	TeamBuilder.loadTeamList(server);
};

exports.parse = function(server, room, message, isIntro, spl) {
	switch (spl[0]) {
		case 'updatechallenges':
			ChallManager.parse(server, room, message, isIntro, spl);
			break;
		case 'tournament':
			TourManager.parse(server, room, message, isIntro, spl);
			break;
		case 'rated':
			LadderManager.reportBattle(server, room);
			break;
	}

	if (!server.rooms[room]) {
		if (spl[0] !== 'init' || spl[1] !== 'battle') return;
	} else if (server.rooms[room].type !== "battle") return;

	try {
		BattleBot.receive(server, room, message, isIntro);
	} catch (e) {
		Monitor.log(e, null ,server);
	}
};

exports.initCmds = function(server) {
	BattleBot.tryJoinAbandonedBattles();
}
exports.readyToDie = function() {
	let battles = Object.keys(BattleBot.battles);
	if (battles.length) return ("There are " + battles.length + " battles in progress");
}

exports.destroy = function() {
	LadderManager.destroy();
	BattleBot.destroy();
	//if (Features[exports.id]) delete Features[exports.id];
}