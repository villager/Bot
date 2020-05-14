"use strict";

const FS = require('./lib/fs');

let Chat = module.exports;
Chat.globalCommands = {};


Chat.psCommands = {};

Chat.discordCommands = {};

Chat.packageData = {};

Chat.loadPlugins = function() {
    // Load package
    FS('package.json').readIfExists().then(data => {
        if (data) Chat.packageData = JSON.parse(data);
    });
    /**
     * Cargar comandos Globales
     */
    let globalFiles = FS('./plugins').readdirSync();
    for (const file of globalFiles) {
        const plugin = require(`./plugins/${file}`);
        if(plugin.commands) {
            Object.assign(Chat.globalCommands, plugin.commands);
        }
    }    
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
    Object.assign(Chat.discordCommands, Chat.globalCommands);
    /**
     * Cargar comandos de Pokemon Showdown
     */
    let psFiles = FS('./showdown/plugins').readdirSync();
    for (const file of psFiles) {
        const plugin = require(`./showdown/plugins/${file}`);
        if(plugin.commands) {
            Object.assign(Chat.psCommands, plugin.commands);
        }
    }
    Object.assign(Chat.psCommands, Chat.globalCommands);

};