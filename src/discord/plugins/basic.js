exports.commands = {
	errorlog() {
		if(!this.can('hotpatch')) return false;
		let log = Tools.FS('../logs/errors.log').readSync().toString();
		Tools.Hastebin.upload(log, (r, link) =>{
			let fullLink = 'https://' + link;
			if(r) this.linkifyReply('Errores', 'Log de errores global del Bot', fullLink);
			else this.sendReply('Lo sentimos, no fue posible encontrar los logs');
		});
	},
    about() {
        let packageData = Chat.packageData;
        this.linkifyReply('Acerca de mi...',
        `Soy ${Config.name} un bot multi-plataforma creado 
        por ${packageData.author && packageData.author.name} para el servidor Space Showdown
        `, packageData.url);
    },
    test() {
		this.test();
	}
};