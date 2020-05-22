const BaseClient = require('discord.js').Client;
const {Parser} = require('./chat');

class DiscordClient extends BaseClient {
    constructor() {
        super()
        this.activity = `Usame con: ${Config.trigger}`;
		this.plugins = new Parser(this);
        this.lastUser = '';
        this.id = 'discord';
        this.lastMessage = '';
        this.language = 'es';
        this.name = Config.name;
    }

    status() {
        this.on('ready', () => {
            this.user.setActivity(this.activity);
        })
    }
    sendMsg(id, message) {
        let sendRoom = null;
        this.guilds.cache.forEach(guild => {
            guild.channels.cache.forEach(channel => {
                if(channel.id === id) sendRoom = channel;
            })
        });
        if(sendRoom) {
            sendRoom.send(message);
            return true;
        } else{
            return false;
        }
    }
	sendDM(id, message) {
		let sendTo = null;
        this.guilds.cache.forEach(guild => {
            guild.members.cache.forEach(user => {
                if(user.id === id) {
                    sendTo = user;
                }			
            });
		})
		if(sendTo) {
			sendTo.send(message);
			return true;
		} else return false;
	}
    logs() {
        this.on('error', e => new Error(`${e} \n`));
        this.on('warn', e => new Error(`WARN STATUS: ${e}\n`));
        //this.on('debug', e => console.log(`DEBUG STATUS: ${e}\n`)); -- No spam
    }
    connect() {
        this.status();
        this.logs();
        this.on('message', async message => {
            this.plugins.parse(message);

        });
        // Connection to discord
        this.login(Config.token);
        console.log(`${Config.name} conectado correctamente a Discord`);

    }
}
module.exports = DiscordClient;