"use strict";

const DiscordClient = require('discord.js').Client;
const Embed = require('./lib/embed');

class Client extends DiscordClient {
    constructor() {
        super()
        this.activity = `Usame con: ${Config.trigger}`;
		this.plugins = new Plugins(this);
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
class Plugins {
    constructor(bot) {
		this.bot = bot;
    }
    splitCommand(message) {
		this.cmd = '';
		this.cmdToken = '';
		this.target = '';
		if (!message || !message.trim().length) return;


        let cmdToken = message.charAt(0);
        if(Config.trigger !== cmdToken) return;
		if (cmdToken === message.charAt(1)) return;
		let cmd = '', target = '';
		let spaceIndex = message.indexOf(' ');
		if (spaceIndex > 0) {
			cmd = message.slice(1, spaceIndex).toLowerCase();
			target = message.slice(spaceIndex + 1);
		} else {
			cmd = message.slice(1).toLowerCase();
			target = '';
		}

		let curCommands = Chat.discordCommands;
		let commandHandler;
		let fullCmd = cmd;

		do {
			if (Object.prototype.hasOwnProperty.call(curCommands, cmd)) {
				commandHandler = curCommands[cmd];
			} else {
				commandHandler = undefined;
			}
			if (typeof commandHandler === 'string') {
				// in case someone messed up, don't loop
				commandHandler = curCommands[commandHandler];
			} else if (Array.isArray(commandHandler) && !recursing) {
				return this.splitCommand(cmdToken + 'help ' + fullCmd.slice(0, -4), true);
			}
			if (commandHandler && typeof commandHandler === 'object') {
				let spaceIndex = target.indexOf(' ');
				if (spaceIndex > 0) {
					cmd = target.substr(0, spaceIndex).toLowerCase();
					target = target.substr(spaceIndex + 1);
				} else {
					cmd = target.toLowerCase();
					target = '';
				}

				fullCmd += ' ' + cmd;
				curCommands = commandHandler;
			}
		} while (commandHandler && typeof commandHandler === 'object');

		if (!commandHandler && curCommands.default) {
			commandHandler = curCommands.default;
			if (typeof commandHandler === 'string') {
				commandHandler = curCommands[commandHandler];
			}
		}
		this.cmd = cmd;
		this.cmdToken = cmdToken;
		this.target = target;
		this.fullCmd = fullCmd;

		return commandHandler;
    }
    parse(message) {
		this.bot.lastMessage = message.content;
		this.bot.lastUser = message.author;
		this.channel = message.channel;
		let commandHandler = this.splitCommand(message.content);

		if (typeof commandHandler === 'function') {
			if(toId(this.bot.lastUser.username) === toId(Config.name)) return; // Ignorar los  comandos dichos por el mismo bot
            const channel = message.channel;
            this.channel = channel;
            this.user = message.author;
            this.message = message.content;
            message = this.run(commandHandler);
		}        
    }
    sendReply(data) {
        return this.channel.send(data);
    }
    linkifyReply(title, data, url) {
        return this.sendReply(Embed.notify(title, data).setURL(url));
    }
    embedReply(title, data) {
        return this.sendReply(Embed.notify(title, data));
	}
	runHelp(help) {
		let commandHandler = this.splitCommand(`.help ${help}`);
		this.run(commandHandler);
	}
    run(commandHandler) {
        if (typeof commandHandler === 'string') commandHandler = Chat.commands[commandHandler];
		let result;
		try {
			result = commandHandler.call(this, this.target, this.user, this.message);
		} catch (err) {
			Monitor.log(err,{
				user: this.user.username,
				message: this.message,
			}, 'Discord');;
		}
		if (result === undefined) result = false;
		return result;      
    }
}
module.exports = new Client();