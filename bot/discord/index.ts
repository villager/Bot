import * as BaseDiscord from 'discord.js';
import {Parser} from './chat';

export class DiscordClient extends BaseDiscord.Client {
	activity: string;
	plugins: Parser;
	lastUser: any;
	lastMessage: string;
    constructor() {
        super()
        this.activity = `Usame con: ${Config.trigger}`;
		this.plugins = new Parser(this);
		this.lastUser = '';
		this.lastMessage = '';
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