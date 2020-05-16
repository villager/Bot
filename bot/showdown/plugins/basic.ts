export const commands = {
    errorlog: function(target:any, room:any, user:any) {
        if(!this.can('hotpatch')) return false;
        let log = Tools.FS('./logs/errors.log').readSync().toString();
        Tools.Hastebin.upload(log, function (r, link) {
            let fullLink = 'https://' + link;
            if(r) this.sendReply(`Logs de errores del servidor ${fullLink}`);
            else this.sendReply('Lo sentimos, no fue posible encontrar los logs');
        }.bind(this));
    },
    about: function() {
        let packageData = Chat.packageData;
        this.sendReply(`Soy ${Config.name} un bot multi-plataforma creado por ${packageData.author && packageData.author.name} para el servidor Space Showdown, puedes ver mi codigo en ${packageData.url}`);
    },
};