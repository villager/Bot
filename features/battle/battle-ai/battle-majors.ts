/*
	Majors
*/
import * as battleDataFile from './battle-data';

const battleData = battleDataFile;

const Move = battleData.Move;

export const major = {
	rated: function (args:any, kwargs?:any) {
		this.rated = true;
	},

	request: function (args:any, kwargs?:any) {
        args.shift();
        let data = args.join("|");
        if (!isNaN(data.substr(0, 1)) && data.substr(1, 1) === '|') {
            this.nextIsRequest = true;
            return;
        }
        try {
            this.request = JSON.parse(data);
        } catch (err) {
            return;
		}
        this.rqid = this.request ? this.request.rqid : -1;
	},

	start: function (args:any, kwargs?:any) {
		this.started = true;
		this.checkTimer();
	},

	turn: function (args:any, kwargs?:any) {
		this.turn = parseInt(args[1]) || 0;
		this.checkTimer();
		this.makeDecision();
	},

	tier: function (args:any, kwargs?:any) {
		if (!args[1]) args[1] = '';
		for (let i in kwargs) args[1] += '[' + i + '] ' + kwargs[i];
		this.tier = args[1];
		if (toId(this.tier) === "inversebattle") {
			this.conditions["inversebattle"] = true;
		}
		this.start();
	},

	gametype: function (args:any, kwargs?:any) {
		this.gametype = args[1];
		this.conditions["gametype"] = args[1];
		switch (args[1]) {
			default:
				this.players.p1.active = [null];
				this.players.p2.active = [null];
				break;
			case 'doubles':
				this.players.p1.active = [null, null];
				this.players.p2.active = [null, null];
				break;
			case 'triples':
			case 'rotation':
				this.players.p1.active = [null, null, null];
				this.players.p2.active = [null, null, null];
				break;
		}
	},

	variation: function (args:any, kwargs?:any) {
		this.variations.push(args[1]);
	},

	rule: function (args:any, kwargs?:any) {
		this.rules.push(args[1].split(':')[0]);
	},

	inactive: function (args:any, kwargs?:any) {
		this.timer = true;
		if (args[1]) {
			if (args[1].indexOf("Battle timer is now ON") === 0 || args[1].indexOf("You have") === 0 || args[1].indexOf(this.server.name) >= 0) this.makeDecision();
		}
	},

	inactiveoff: function (args:any, kwargs?:any) {
		this.timer = false;
	},

	j: "join",
	join: function (args:any, kwargs?:any) {
		this.users[toId(args[1])] = args[1];
	},

	l: "leave",
	leave: function (args:any, kwargs?:any) {
		if (this.users[toId(args[1])]) delete this.users[toId(args[1])];
	},

	player: function (args:any, kwargs?:any) {
		let id = args[1];
		let name = args[2];
		let avatar = args[3];
		if (this.players[id]) {
			this.players[id].setName(name || "");
			this.players[id].avatar = avatar || 0;
			if (this.players[id].userid) {
				if (this.players[id].userid === toId(this.server.name)) {
					this.self = this.players[id];
				} else {
					this.foe = this.players[id];
				}
			}
		}
	},

	win: function (args:any, kwargs?:any, isIntro?:Boolean) {
		if (!isIntro) this.win(args[1]);
		this.ended = true;
		this.leave();
	},

	tie: function (args:any, kwargs?:any, isIntro?:Boolean) {
		this.ended = true;
		if (!isIntro) this.message("tie");
		this.leave();
	},

	prematureend: function (args:any, kwargs?:any) {
		this.ended = true;
		this.leave();
	},

	clearpoke: function (args?:any, kwargs?:any) {
		this.players.p1.teamPv = [];
		this.players.p2.teamPv = [];
		for (let i = 0; i < this.players.p1.active.length; i++) {
			this.players.p1.active[i] = null;
			this.players.p1.active[i] = null;
		}
	},

	poke: function (args:any, kwargs?:any) {
		let p = args[1];
		if (!this.players[p]) return;
		this.players[p].teamPv.push(this.parseDetails(args[2]));
	},

	detailschange: function (args:any, kwargs?:any) {
		let poke = this.getActive(args[1]);
		let details = this.parseDetails(args[2]);
		poke.removeVolatile('formechange');
		poke.removeVolatile('typeadd');
		poke.removeVolatile('typechange');
		for (let i in details) poke[i] = details[i];
		poke.template = battleData.getPokemon(details.species, this.gen);
	},

	teampreview: function (args:any, kwargs?:any) {
		if (args[1]) this.teamPreview = parseInt(args[1]) || 1;
		this.makeDecision();
		this.checkTimer();
	},

	drag: "switch",
	"replace": "switch",
	"switch": function (args:any, kwargs?:any) {
		let spl = args[1].split(": ");
		let p = spl[0].substr(0, 2);
		let slot = this.parseSlot(spl[0].substr(2, 1));
		let name = Tools.toName(spl[1]);
		let details = this.parseDetails(args[2]);
		let health = this.parseStatus(args[3]);
		/* Get the pokemon or create a new one */
		let poke = null;
		for (let i = 0; i < this.players[p].pokemon.length; i++) {
			if (this.players[p].pokemon[i].name === name)
				poke = this.players[p].pokemon[i];
		}
		if (!poke) {
			poke = new battleData.Pokemon(battleData.getPokemon(details.species, this.gen), {name: name});
			this.players[p].pokemon.push(poke);
		}
		poke.active = true;
		poke.slot = slot;
		for (let i in details) poke[i] = details[i];
		poke.hp = health.hp;
		poke.status = health.status;
		poke.helpers.sw = this.turn;
		/* Get the active */
		let active = this.players[p].active[slot];
		if (!active) {
			/* Forced switch */
			this.players[p].active[slot] = poke;
		} else {
			/* Normal switch */
			if (active.passing && active.passing === this.turn) {
				/* Pass the boost and volatiles */
				active.removeVolatile('airballoon');
				active.removeVolatile('attract');
				active.removeVolatile('autotomize');
				active.removeVolatile('disable');
				active.removeVolatile('foresight');
				active.removeVolatile('imprison');
				active.removeVolatile('mimic');
				active.removeVolatile('miracleeye');
				active.removeVolatile('smackdown');
				active.removeVolatile('torment');
				active.removeVolatile('typeadd');
				active.removeVolatile('typechange');
				active.removeVolatile('yawn');
				active.removeVolatile('transform');
				active.removeVolatile('formechange');
				for (let vol in active.volatiles) poke.addVolatile(vol);
				for (let b in active.boosts) poke.boosts[b] = active.boosts[b];
				active.passing = false;
			}
			active.removeAllVolatiles();
			active.removeAllBoosts();
			if (active.transformed) active.unTransform();
			active.supressedAbility = false;
			active.ability = active.baseAbility;
			active.active = false;
			active.slot = -1;
			this.players[p].active[slot] = poke;
		}
	},

	faint: function (args:any, kwargs?:any, isIntro?:Boolean) {
		let poke = this.getActive(args[1]);
		let det = this.parsePokemonIdent(args[1]);
		poke.fainted = true;
		poke.active = false;
		poke.passing = false;
		poke.hp = 0;
		if (!isIntro) this.message("faint", det.side, poke.name);
	},

	swap: function (args:any, kwargs?:any) {
		let poke = this.parsePokemonIdent(args[1]);
		let to = parseInt(args[2]) || 0;
		let player = this.players[poke.side];
		let temp = player.active[poke.slot];
		player.active[poke.slot] = player.active[to];
		player.active[to] = temp;
	},

	move: function (args:any, kwargs?:any) {
		let poke = this.getActive(args[1]);
		let det = this.parsePokemonIdent(args[1]);
		let poke2 = this.getActive(args[3]);
		let moveTemplate = battleData.getMove(args[2], this.gen);
		let fromeffect = null;
		let noDeductPP = false;
		if (kwargs.from) fromeffect = battleData.getEffect(kwargs.from, this.gen);
		if (fromeffect) {
			switch (fromeffect.id) {
				case 'snatch':
				case 'magicbounce':
				case 'magiccoat':
				case 'rebound':
				case 'metronome':
				case 'naturepower':
					return; // Not a real move
				case 'sleeptalk':
					noDeductPP = true; // Real move, but not really used
					break;
			}
		}
		let move = null;
		for (let i = 0; i < poke.moves.length; i++) {
			if (poke.moves[i].id ===  moveTemplate.id) {
				move = poke.moves[i];
				break;
			}
		}
		if (!move) {
			move = new Move(moveTemplate);
			if (poke.transformed) move.pp = 5;
			poke.moves.push(move);
		}
		if (move.id === 'wish' || move.id === 'healingwish' || move.id === 'lunardance') {
			this.players[det.side].side.wish = {
				move: move.id,
				turn: this.turn,
				poke: poke
			};
		}
		if (move.id === 'batonpass') {
			poke.passing = this.turn;
		}
		if (!noDeductPP && kwargs.from !== 'lockedmove') {
			if (args[1] !== args[3] && poke2 && poke2.ability && poke2.ability.id === "pressure") {
				move.pp -= 2;
			} else {
				move.pp--;
			}
		} else {
			poke.prepared = null;
		}
		poke.helpers.lastMove = move.id;
		poke.helpers.lastMoveTurn = this.turn;
	},

	cant: function (args:any, kwargs?:any, isIntro?:Boolean) {
		let poke = this.getActive(args[1]);
		let effect = battleData.getEffect(args[2], this.gen);
		let moveTemplate = battleData.getMove(args[3] || "", this.gen);
		let det = this.parsePokemonIdent(args[1]);
		switch (effect.id) {
			case 'taunt':
			case 'gravity':
			case 'healblock':
			case 'imprison':
			case 'skydrop':
			case 'recharge':
			case 'focuspunch':
			case 'nopp':
				break;
			case 'slp':
				if (!poke.helpers.sleepCounter) poke.helpers.sleepCounter = 0;
				poke.helpers.sleepCounter++;
				if (!isIntro) this.message(effect.id, det.side, poke.name); // hax
				return;
			case 'par':
			case 'frz':
			case 'flinch':
			case 'attract':
				if (!isIntro) this.message(effect.id, det.side, poke.name); // hax
				return; // No move
		}
		let move = null;
		for (let i = 0; i < poke.moves.length; i++) {
			if (poke.moves[i].id ===  moveTemplate.id) {
				move = poke.moves[i];
				break;
			}
		}
		if (!move) {
			move = new Move(moveTemplate);
			if (poke.transformed) move.pp = 5;
			poke.moves.push(move);
		}
	},

	gen: function (args:any, kwargs?:any) {
		this.gen = parseInt(args[1], 10);
	},

	title: function (args:any, kwargs?:any) {
		this.title = parseInt(args[1], 10);
	},

	callback: function (args:any, kwargs?:any) {
		args.shift();
		let pokemon = isNaN(Number(args[1])) ? this.getActive(args[1]) : this.self.active[args[1]];
		let requestData = this.request.active[pokemon.slot];
		switch (args[0]) {
			case 'trapped':
				requestData.trapped = true;
				break;
			case 'cant':
				for (let i = 0; i < requestData.moves.length; i++) {
					if (requestData.moves[i].id === args[3]) {
						requestData.moves[i].disabled = true;
					}
				}
				break;
		}
		this.makeDecision(true);
	}
};