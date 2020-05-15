'use strict';

exports.commands = {
 
	errorlog: function(target, user) {
		if(!this.can('hotpatch')) return false;
		let log = Tools.FS('./logs/errors.log').readSync().toString();
		Tools.Hastebin.upload(log, function (r, link) {
			let fullLink = 'https://' + link;
			if(r) this.linkifyReply('Errores', 'Log de errores global del Bot', fullLink);
			else this.sendReply('Lo sentimos, no fue posible encontrar los logs');
		}.bind(this));
	},
    about: function() {
        let packageData = Chat.packageData;
        this.linkifyReply('Acerca de mi...',
        `Soy ${Config.name} un bot multi-plataforma creado 
        por ${packageData.author && packageData.author.name} para el servidor Space Showdown
        `, packageData.url);
    },
    
};