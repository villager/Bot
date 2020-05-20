
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
class GBot extends EventEmitter {
    constructor() {
        super();
        this.discord = Discord = new DiscordClient();
        this.servers = Object.create(null);
        for (let i in Config.servers) {
            let Server = Config.servers[i];
            this.servers[i] = bots[i] = new PSBot(Server);

        }
    }
    connect() {
        Features.initData();
        for (let i in this.servers) {
            let Server = this.servers[i];
            Server.connect();
            Server.connection.on('message', () => {
                Chat.loadPlugins();
            });
            Server.connection.on('close', (code, message) => {
                console.log('Disconnected from ' + i  + ': ' + code);
                if (Server.disconnecting) return;
                console.log('Connection lost to ' +i  + ': ' + message);
                delete this.servers[i];
                if (!Server.autoreconnect) return;
                console.log('Reconnecting to ' + i + ' in one minute.');
                let reconnect = setTimeout(() => {
                    this.servers[i] = new PSBot(Config.servers[i]);
                    this.servers[i].connect();
                    clearInterval(reconnect);
                }, 60 * 1000);
            });
        }
        this.discord.connect();
    }
}
const GlobalBot = global.GlobalBot = new GBot ();
GlobalBot.connect();

function getBot(bot) {
    if(!bots[bot]) return false;
    return bots[bot];
}
global.Bot = getBot;

Bot.forEach = function(callback, thisArg) {
    Object.values(bots).forEach(callback, thisArg);
};