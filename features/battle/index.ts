"use strict";

import * as BattleBotPath from './battle-ai';
export const BattleBot = BattleBotPath;
import * as TeamBuilderPath from './teambuilder';
export const TeamBuilder = TeamBuilderPath;
import * as ChallManagerPath from './challenges';
export const ChallManager = ChallManagerPath;
import * as LadderManagerPath from './ladder';
export const LadderManager = LadderManagerPath;
import * as TourManagerPath from './tournaments';
export const TourManager = TourManagerPath;

export const key = 'showdown'; 

export function init (server?: any) {
	BattleBot.init();
	TourManager.clearData(server);
	TeamBuilder.loadTeamList(server);
}

export function parse(server:any, room:string, message:any, isIntro:Boolean, spl:any) {
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
}

export function initCmds (server?:any) {
	return BattleBot.tryJoinAbandonedBattles();
}
export function readyToDie () {
	var battles = Object.keys(BattleBot.battles);
	if (battles.length) return ("There are " + battles.length + " battles in progress");
}

export function destroy () {
	LadderManager.destroy();
	BattleBot.destroy();
	//if (Features[exports.id]) delete Features[exports.id];
}