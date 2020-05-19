
const Chat = module.exports = {};

Chat.globalCommands = {};
Chat.psCommands = {};
Chat.discordCommands = {};
Chat.packageData = {};

Chat.loadPlugins = function() {
    Tools.FS('package.json').readIfExists().then(data => {
        if (data) Chat.packageData = JSON.parse(data);
    });
     /**
     * Cargar comandos Globales
    */
    let globalFiles = Tools.FS('./plugins').readdirSync();
    for (const file of globalFiles) {
        const plugin = require(`./plugins/${file.slice(0, -3)}`);
        if(plugin.commands) Object.assign(Chat.globalCommands, plugin.commands);
    }    
    /**
     * Cargando comandos de Discord
    */
    let discordFiles = Tools.FS('./discord/plugins').readdirSync();
    for (const file of discordFiles) {
        const plugin = require(`./discord/plugins/${file.slice(0, -3)}`);
        if(plugin.commands) Object.assign(Chat.discordCommands, plugin.commands);
    }
    Object.assign(Chat.discordCommands, Chat.globalCommands);
    /**
     * Cargar comandos de Pokemon Showdown
     */
    let psFiles = Tools.FS('./showdown/plugins').readdirSync();
    for (const file of psFiles) {
        const plugin = require(`./showdown/plugins/${file.slice(0, -3)}`);
        if(plugin.commands) Object.assign(Chat.psCommands, plugin.commands);
    }
    Object.assign(Chat.psCommands, Chat.globalCommands);
};
