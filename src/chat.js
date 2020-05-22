
const Chat = module.exports = {};

Chat.globalCommands = {};
Chat.psCommands = {};
Chat.discordCommands = {};
Chat.packageData = {};

Chat.loadPlugins = function() {
    Tools.FS('../package.json').readIfExists().then(data => {
        if (data) Chat.packageData = JSON.parse(data);
    });
     /**
     * Cargar comandos Globales
    */
    let globalFiles = Tools.FS('./plugins').readdirSync();
    for (const file of globalFiles) {
        if(file.substr(-5) === '.json') continue;
        const plugin = require(`./plugins/${file.slice(0, -3)}`);

        if(plugin.commands) Object.assign(Chat.globalCommands, plugin.commands);
    }    
    /**
     * Cargando comandos de Discord
    */
    let discordFiles = Tools.FS('./discord/plugins').readdirSync();
    for (const file of discordFiles) {
        if(file.substr(-5) === '.json') continue;
        const plugin = require(`./discord/plugins/${file.slice(0, -3)}`);
        if(plugin.commands) Object.assign(Chat.discordCommands, plugin.commands);
    }
    Object.assign(Chat.discordCommands, Chat.globalCommands);
    /**
     * Cargar comandos de Pokemon Showdown
     */
    let psFiles = Tools.FS('./showdown/plugins').readdirSync();
    for (const file of psFiles) {
        if(file.substr(-5) === '.json') continue;
        const plugin = require(`./showdown/plugins/${file.slice(0, -3)}`);
        if(plugin.commands) Object.assign(Chat.psCommands, plugin.commands);
    }
    Object.assign(Chat.psCommands, Chat.globalCommands);
};
Chat.hasAuth = function(id, user, perm) {
    if(id === 'discord') return true; // Luego me pongo con esto
    for (const owner of Config.owners) {
        if(owner.id === user.id) return true;
        for (const aliases of owner.aliases) {
            if(aliases === user.id) return true;
        }
    }
    let rank = Config.permissions[perm];
    if(rank == user.group) return true; // It's equal 
    if (Config.rankList.indexOf(user.group) >= Config.rankList.indexOf(rank)) return true;
    return false;
};