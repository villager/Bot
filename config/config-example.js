"use strict";

const Config = exports;

/**
 * Global Config
 */
Config.trigger = '.';
/**
 * Config Pokemon Showdown
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
        rooms: ["room1", "room2"],
        name: "nick2",
        password: "pass2"
    }
};
/**
 * Config Discord
 */
Config.token = ''; 
Config.name = '';