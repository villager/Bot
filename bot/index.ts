
declare const global: any;

import * as events from 'events';
const EventEmitter = events.EventEmitter;
import {DiscordClient} from './discord';
import {PSBot} from './showdown';

import * as Config from '../config/config';
global.Config = Config;


import * as Monitor from '../lib/monitor';
global.Monitor = Monitor;



import {Chat} from './chat';
global.Chat = Chat;

import * as Tools from '../tools';
global.Tools = Tools;

global.toId = Tools.toId;
global.splint = Tools.splint;
global.toUserName = Tools.toUserName;

import * as Features from '../features';
global.Features = Features;
Features.loadFeatures();

class GlobalBot extends EventEmitter {
    servers: PSBot;
    discord: any;
    constructor() {
        super();
        this.discord = new DiscordClient();
        this.servers = Object.create(null);
        for (let i in Config.servers) {
            let Server = Config.servers[i];
            this.servers[i] = new PSBot(Server);

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
global.Bot = new GlobalBot ();
Bot.connect();