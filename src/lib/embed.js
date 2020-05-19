
"use strict";

const { MessageEmbed } = require('discord.js');


class Embed extends MessageEmbed {
    constructor(options = {}) {
        super(options);
    }

    new(options = {}) {
        return new Embed(options);
    }

    denied() {
        return this.new()
            .setTitle('Acceso denegado')
            .setColor([213, 41, 32])
            .setDescription(`No tienes suficiente autoridad para usar este comando.`)
    }

    static notify(title, desc, color) {
        if(!color) color =  [57, 140, 232];
        return new Embed()
            .setTitle(title)
            .setColor(color)
            .setDescription(desc);
    }
}
module.exports = Embed;