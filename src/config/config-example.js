"use strict";

const Config = exports;

/**
 * Global Config
 */
Config.trigger = '.';

Config.owners = [
    {
        id: 'owner1',
        aliases: ['owner1', 'discord_nick', 'ps_nick1'],
    }
];

Config.YT_Key = ''; 

Config.language = 'en'; // language for helps

/**
 * Pokemon Showdown Config
 */
Config.initCmds = [];

Config.maxBattles = 5;

Config.tourDefault = {
	format: 'gen8ou',
	type: 'elimination',
	maxUsers: null,
	timeToStart: 30 * 1000,
	autodq: 1.5,
	scoutProtect: false
};
Config.formatAliases = {
	'random': 'Random Battle',
	'randomdoubles': 'Random Doubles Battle',
	'randomtriples': 'Random Triples Battle',
	'doubles': 'Doubles OU',
	'triples': 'Smogon Triples',
	'vgc': 'Battle Spot Doubles (VGC 2015)',
	'vgc2015': 'Battle Spot Doubles (VGC 2015)',
	'ag': 'Anything Goes',
	'oras': 'OU',
	'bw': '[Gen 5] OU',
	'dpp': '[Gen 4] OU',
	'adv': '[Gen 3] OU',
	'gsc': '[Gen 2] OU',
	'rby': '[Gen 1] OU'
};

Config.battleModules = {
	/* Algorithms for use in battles */
	"challengecup1v1": "ingame-nostatus",
	"1v1": "ingame-nostatus"
};

Config.servers = {
    "example1": {
        id: "example1",
        ip: "0.0.0.0",
        port: 8000,
        rooms: ["room1", "room2"],
        name: "nick1",
        initCmds: ['/avatar evelyn'],
        password: "pass1",

    },
    "example2": {
        id: "example1",
        ip: "0.0.0.0",
        port: 8000,
        rooms: ["room1", "room2"],
        initCmds: ['/avatar evelyn'],
        name: "nick2",
        password: "pass2"
    }
};
/**
 * Discord Config
 */
Config.token = ''; 
Config.name = '';