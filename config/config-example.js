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
/**
 * Pokemon Showdown Config
 */
Config.initCmds = [];

Config.maxBattles = 5;

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