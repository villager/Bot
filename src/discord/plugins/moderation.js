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
    kick: function(target, user, message) {
        if (!message.guild) return this.sendReply('No valido para este medio');
        if (!target) return this.sendReply('Especifica a un usuario');
        const member = message.guild.member(target);
        member
          .kick('Optional reason that will display in the audit logs')
          .then(() => {
            // We let the message author know we were able to kick the person
            this.sendReply(`Successfully kicked ${target}`);
          })
          .catch(err => {
            // An error happened
            // This is generally due to the bot not being able to kick the member,
            // either due to missing permissions or role hierarchy
            this.sendReply('I was unable to kick the member');
            // Log the error
            console.error(err);
          });
    }
};