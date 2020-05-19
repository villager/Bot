exports.commands = {
    pin: function(target, room, user) {

        if(!target) return this.sendReply('Tienes que especificar el mensaje');
        this.channel.fetch(this.messageId).then((m) => {
            m.pin().then(() => {
                this.reply('Message pinned');
                console.log(`Message with ID of ${this.messageId} was pinned in ${this.channel.name} (${this.channel.id}) on guild ${this.guild.name} (${this.guild.id})`);
            });
        }).catch(() => {
            this.sendReply('Failed to pin message. Do I have permission? Are there already 50 pins?');
            console.log(`Failed to pin message with ID of ${this.messageId} was pinned in ${this.channel.name} (${this.channel.id}) on guild ${this.guild.name} (${this.guild.id})`);
        });        
    },
    esay: function(target, room, user) {
        this.sendReply(target);
        this.channel.remove(this.messageId);
    }
};