const BaseClient = require('discord.js').Client;
const {Parser} = require('./chat');

class DiscordClient extends BaseClient {
    constructor() {
        super()
        this.activity = `Usame con: ${Config.trigger}`;
		this.plugins = new Parser(this);
		this.lastUser = '';
        this.lastMessage = '';
        this.name = Config.name;
    }

    status() {
        this.on('ready', () => {
            this.user.setActivity(this.activity);
        })
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