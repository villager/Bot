
import {FS} from '../lib/fs';

export type ChatHandler = (
	this: any,
	target: string,
	room: string,
	user: string,
	cmd: string,
	message: string
) => void;

export interface ChatCommands {
	[k: string]: ChatHandler | string | string[] | true | ChatCommands;
}
export const Chat = new class {
    globalCommands: any  = {}; // Interfance para los globales
    psCommands: any  ={}; // Pokemon showdown 
    discordCommands: any  = {}; // discord
    packageData: any = {};
    loadPlugins  () {
        // Load package
        void FS('package.json').readIfExists().then(data => {
            if (data) Chat.packageData = JSON.parse(data);
        });
        /**
         * Cargar comandos Globales
         */
        let globalFiles = FS('./bot/plugins').readdirSync();
        for (const file of globalFiles) {
            const plugin = require(`./plugins/${file.slice(0, -3)}`);
            if(plugin.commands) {
                Object.assign(Chat.globalCommands, plugin.commands);
            }
        }    
        /**
         * Cargando comandos de Discord
         */
        let discordFiles = FS('./bot/discord/plugins').readdirSync();
        for (const file of discordFiles) {
            const plugin = require(`./discord/plugins/${file.slice(0, -3)}`);
            if(plugin.commands) {
                Object.assign(Chat.discordCommands, plugin.commands);
            }
        }
        Object.assign(Chat.discordCommands, Chat.globalCommands);
        /**
         * Cargar comandos de Pokemon Showdown
         */
        let psFiles = FS('./bot/showdown/plugins').readdirSync();
        for (const file of psFiles) {
            const plugin = require(`./showdown/plugins/${file.slice(0, -3)}`);
            if(plugin.commands) {
                Object.assign(Chat.psCommands, plugin.commands);
            }
        }
        Object.assign(Chat.psCommands, Chat.globalCommands);
    
    }
}
