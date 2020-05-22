const Lang = Features('languages').load();

exports.commands = {
    errorlog: function(target, room, user) {
        if(!this.can('hotpatch', true)) return false;
        let log = Tools.FS('../logs/errors.log').readSync().toString();
        Tools.Hastebin.upload(log, (r, link) => {
            let fullLink = 'https://' + link;
            if(r) this.sendReply(Lang.replaceSub(this.lang, 'errorlog', 'link',fullLink));
            else this.sendReply(Lang.getSub(this.lang, 'errorlog', 'error'));
        });
    },  
    about: function() {
        let version = Chat.packageData.url;
        let author = Chat.packageData.author && Chat.packageData.author.name;
        this.sendReply(Lang.replace(this.lang, 'about', Config.name,author, version));
    },
};