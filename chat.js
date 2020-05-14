"use strict";

const FS = require('./lib/fs');

let Chat = module.exports;

Chat.psCommands = {};

Chat.discordCommands = {};

Chat.packageData = {};

Chat.loadPlugins = function() {
    // Load package
    FS('package.json').readIfExists().then(data => {
        if (data) Chat.packageData = JSON.parse(data);
    });
    /**
     * Cargando comandos de Discord
     */
    let discordFiles = FS('./discord/plugins').readdirSync();
    for (const file of discordFiles) {
        const plugin = require(`./discord/plugins/${file}`);
        if(plugin.commands) {
            Object.assign(Chat.discordCommands, plugin.commands);
        }
    }
};