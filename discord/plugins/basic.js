'use strict';

exports.commands = {
    version: function(target, user) {
        return this.sendReply(`La version del Bot es ${Chat.packageData.version}`);
    },
    say: function(target, user) {
        if(!target) return this.sendReply('Debes especificar algo para decir');
        this.sendReply(target);
    },
    about: function() {
        let packageData = Chat.packageData;
        this.linkifyReply('Acerca de mi...',
        `Soy ${Config.name} un bot multi-plataforma creado 
        por ${packageData.author && packageData.author.name} para el servidor Space Showdown
        `, packageData.url);
    },
    pick: function(target) {
        if (!target) return false;
        if (!target.includes(',')) return this.parse('/help pick');
        const options = target.split(',');
        const pickedOption = options[Math.floor(Math.random() * options.length)].trim();
        return this.sendReply(`Opcion elegida: **${pickedOption}**`);
    }
};