/**
 * Random Decision
 */

'use strict';

export function setup (Data?:any) {
	const BattleModule:any = {};
	BattleModule.id = "random";

	BattleModule.decide = function (battle:any, decisions:any) {
		return decisions[Math.floor(Math.random() * decisions.length)];
	};

	return BattleModule;
}