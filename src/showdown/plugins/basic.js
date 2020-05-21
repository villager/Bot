exports.commands = {
    errorlog: function(target, room, user) {
        if(!this.can('hotpatch', true)) return false;
        let log = Tools.FS('../logs/errors.log').readSync().toString();
        Tools.Hastebin.upload(log, (r, link) => {
            let fullLink = 'https://' + link;
            if (r) this.replyTrad('link', fullLink);
            else this.replyTrad('error');
        });
    },  
    about: function() {
        let packageData = Chat.packageData;
        this.strictTrad('msg', Config.name, (packageData.author && packageData.author.name), packageData.url);
    },
};