
const EventEmitter = require('events').EventEmitter;
const DiscordClient = require('./discord');
const PSBot = require('./showdown');

global.Config = require('./config/config');

global.Monitor = require('./lib/monitor');

global.Tools = require('./tools');

global.toId = Tools.toId;
global.splint = Tools.splint;
global.toUserName = Tools.toUserName;
global.Chat = require('./chat');

global.Features = require('./features');
Features.loadFeatures();
Features.eventEmitter.setMaxListeners(Object.keys(Features.features).length);

let bots = Object.create(null);
global.Discord = null
class GBot {
    constructor() {
        this.discord = Discord = new DiscordClient();
        this.servers = Object.create(null);
        for (let i in Config.servers) {
            let Server = Config.servers[i];
            this.servers[i] = bots[i] = new PSBot(Server);

        }
    }
    checkConnectivity() {
        for (let i in Config.servers) {
            let Server = Config.servers[i];
            console.log('Config '+ this.servers[i]);
            if(!this.servers[i]) {
                console.log('Reconectando a ' + i);
                this.servers[i] = bots[i] = new PSBot(Server);
                this.servers[i].connect();
                Server.connection.on('message', () => {
                    Chat.loadPlugins();
                });
            }
        }
    }
    connect() {
        Features.initData();
        for (let i in this.servers) {
            let Server = this.servers[i];
            Server.connect();
            Chat.loadPlugins();
        }
        this.discord.connect();
    }
}
const GlobalBot = global.GlobalBot = new GBot ();
GlobalBot.connect();
/**
 * Verificar el Status del Bot cada 5 minutos
 */

function getBot(bot) {
    if(!bots[bot]) return false;
    return bots[bot];
}
global.Bot = getBot;

Bot.bots = bots;

Bot.forEach = function(callback, thisArg) {
    Object.values(bots).forEach(callback, thisArg);
};