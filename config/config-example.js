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
Config.servers = {
    "example1": {
        id: "example1",
        ip: "0.0.0.0",
        port: 8000,
        rooms: ["room1", "room2"],
        name: "nick1",
        password: "pass1",

    },
    "example2": {
        id: "example1",
        ip: "0.0.0.0",
        port: 8000,
        rooms: ["room1", "room2"],
        name: "nick2",
        password: "pass2"
    }
};
/**
 * Discord Config
 */
Config.token = ''; 
Config.name = '';