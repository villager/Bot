
import { MessageEmbed } from 'discord.js';


class CustomEmbed extends MessageEmbed {
    options: object;
    constructor(options = {}) {
        super(options);
    }

    new(options = {}) {
        return new CustomEmbed(options);
    }

    denied() {
        return this.new()
            .setTitle('Acceso denegado')
            .setColor([213, 41, 32])
            .setDescription(`No tienes suficiente autoridad para usar este comando.`)
    }

    notify(title:string, desc:string, color?: any) {
        if(!color) color =  [57, 140, 232];
        return this.new()
            .setTitle(title)
            .setColor(color)
            .setDescription(desc);
    }
}
export const Embed = new CustomEmbed();
