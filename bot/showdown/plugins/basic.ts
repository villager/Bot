export const commands = {
    errorlog: function(target:any, room:any, user:any) {
        if(!this.can('hotpatch')) return false;
        let log = Tools.FS('./logs/errors.log').readSync().toString();
        Tools.Hastebin.upload(log, function (r, link) {
            let fullLink = 'https://' + link;
            if (r) this.replyTrad('link', fullLink);
            else this.replyTrad('error');
        }.bind(this));
    },  
    about: function() {
        let packageData = Chat.packageData;
        this.replyTrad('msg', Config.name, (packageData.author && packageData.author.name), packageData.url);
    },
};