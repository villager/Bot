"use strict";

exports.id = 'battle';
exports.desc = 'Automated battle bot';

let BattleBot = exports.BattleBot = require('./battle-ai/index.js');

let TeamBuilder = exports.TeamBuilder = require('./teambuilder.js');

let ChallManager = exports.ChallManager = require('./challenges.js');

let TourManager = exports.TourManager = require('./tournaments.js');

let LadderManager = exports.LadderManager = require('./ladder.js');

exports.init = function () {
	BattleBot.init();
	TourManager.clearData();
	TeamBuilder.loadTeamList();
};

exports.parse = function (server, room, message, isIntro, spl) {
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

exports.getInitCmds = function () {
	return BattleBot.tryJoinAbandonedBattles();
};

exports.readyToDie = function () {
	var battles = Object.keys(BattleBot.battles);
	if (battles.length) return ("There are " + battles.length + " battles in progress");
};

exports.destroy = function () {
	LadderManager.destroy();
	BattleBot.destroy();
	//if (Features[exports.id]) delete Features[exports.id];
};