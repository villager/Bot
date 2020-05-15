/**
 * Battle modules
 */

'use strict';

const modFiles = ['singles-eff.js', 'ingame-nostatus.js', 'random.js', 'random-move.js', 'random-switch.js'];
var Data = require('./battle-data');
let modules = exports.modules = Object.create(null);

modFiles.forEach(function (file) {
	let mod;
	try {
		mod = require(`./modules/${file}`).setup(Data);
		if (!mod.id) return;
		modules[mod.id] = mod;
	} catch (e) {
		Monitor.log(e);
	}
})
exports.choose = function (battle) {
		if (!battle.tier) return null;

		/* Configured Modules */

		let tier = toId(battle.tier);

        if (Config.battleModules && Config.battleModules[toId(battle.tier)]) {
			let modid = Config.battleModules[toId(battle.tier)];
			if (battle.gametype === "singles" || modid !== "singles-eff") {
				if (modules[modid]) {
					console.log("Battle module [" + battle.id + "] - Using " + modid + " (user configuration)");
					return modules[modid];
				}
			} else {
				console.log("Battle module [" + battle.id + "] - Incompatible (user configuration)");
			}
		}

		/* Module decision by default */

		if (tier in {'gen7challengecup1v1': 1, 'challengecup1v1': 1, '1v1': 1}) {
			if (modules["ingame-nostatus"]) {
				console.log("Battle module [" + battle.id + "] - Using ingame-nostatus");
				return modules["ingame-nostatus"];
			}
		}

		if (battle.gametype === "singles") {
			if (modules["singles-eff"]) {
				console.log("Battle module [" + battle.id + "] - Using singles-eff");
				return modules["singles-eff"];
			}
		}

		if (modules["ingame-nostatus"]) {
			console.log("Battle module [" + battle.id + "] - Using ingame-nostatus");
			return modules["ingame-nostatus"];
		}

		/* Random, no module designed */
		console.log("Battle module [" + battle.id + "] - Not found, using random");
		return null;
	};