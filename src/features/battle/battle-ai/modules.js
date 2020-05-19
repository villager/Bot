"use strict";Object.defineProperty(exports, "__esModule", {value: true});/**
 * Battle modules
 */

'use strict';

const modFiles = ['singles-eff', 'ingame-nostatus', 'random', 'random-move', 'random-switch'];

var _battledata = require('./battle-data'); var DataFile = _battledata;
const Data = DataFile; 

 let modules = Object.create(null); exports.modules = modules;

modFiles.forEach(function (file) {
	let mod;
	try {
		mod = require(`./modules/${file}`).setup(Data);
		if (!mod.id) return;
		exports.modules[mod.id] = mod;
	} catch (e) {
		Monitor.log(e);
	}
});

 function choose(battle) {
	if (!battle.tier) return null;

	/* Configured Modules */

	let tier = toId(battle.tier);

    if (Config.battleModules && Config.battleModules[toId(battle.tier)]) {
		let modid = Config.battleModules[toId(battle.tier)];
		if (battle.gametype === "singles" || modid !== "singles-eff") {
			if (exports.modules[modid]) {
				console.log("Battle module [" + battle.id + "] - Using " + modid + " (user configuration)");
				return exports.modules[modid];
			}
		} else {
			console.log("Battle module [" + battle.id + "] - Incompatible (user configuration)");
		}
	}
	/* Module decision by default */
	if (tier in {'gen7challengecup1v1': 1, 'challengecup1v1': 1, '1v1': 1}) {
		if (exports.modules["ingame-nostatus"]) {
			console.log("Battle module [" + battle.id + "] - Using ingame-nostatus");
			return exports.modules["ingame-nostatus"];
		}
	}

	if (battle.gametype === "singles") {
		if (exports.modules["singles-eff"]) {
			console.log("Battle module [" + battle.id + "] - Using singles-eff");
			return exports.modules["singles-eff"];
		}
	}

	if (exports.modules["ingame-nostatus"]) {
		console.log("Battle module [" + battle.id + "] - Using ingame-nostatus");
		return exports.modules["ingame-nostatus"];
	}

	/* Random, no module designed */
	console.log("Battle module [" + battle.id + "] - Not found, using random");
	return null;
} exports.choose = choose;