let users = Object.create(null);
let USERS_PATH = './features/profiles/data/database.json';
require('sugar');
const SaveUsers = () => Tools.FS(USERS_PATH).writeUpdate(() => JSON.stringify(users));

exports.key = 'showdown';

exports.init = function() {
    users = JSON.parse(Tools.FS(USERS_PATH).readSync().toString());
    for (let i in users) {
        users[i] = new User(i, users[i]);
    }
}
class User {
    constructor(user, options) {
        this.id = toId(user);
        this.discord = {
            name: null,
            discriminator: null,
            id: 0,
        }
        this.name = user;
        this.group = '';
        this.lastSeen = {
            date: Date.now(),
            action: null,
            server: false,
            room: null,
        };
        this.alts = [];
        this.inbox = [];
        users[this.id] = this;
        Object.assign(this, options);
    }
    update(user) {
        this.group = user.charAt(0);
        this.name = user;
        SaveUsers();
    }
    updateSeen(id, action, room) {
        this.lastSeen.date = new Date();
        this.lastSeen.action = action;
        this.lastSeen.room = room;
        this.lastSeen.server = id;
        SaveUsers();
    } 
    updateDiscord(options) {
        if(this.discord.id) return false;
        this.discord.discriminator = options.discriminator;
        this.discord.id = options.id;
        SaveUsers();
    }
}
function getUser(user) {
    if(!user) return false;
    if(!users[toUserName(user)]) return false;
    return users[toUserName(user)];
}
exports.get = getUser;
function findByDiscord(discordId) {
    for (let i in users) {
        if(toId(users[i].discord.name) === toUserName(discordId)) return users[i];
    }
    return false;
}

exports.findDiscord = findByDiscord;
exports.isRegistered = function(user) {
    let found = findByDiscord(user.username);
    if (!found) return false;
    found.updateDiscord({
        id: user.id,
        discriminator: user.discriminator
    });
    return true;
}
exports.create = function(user) {
    if(!users[toId(user)]) users[toId(user)] = new User(toId(user));
    SaveUsers();
}
exports.update = function(user) {
    let uid = toId(user);
    if(!users[uid]) return false;
    users[uid].update(user);
}
function checkRegister(id) {
    for (let i in users) {
        let user = users[i];
        if(user.discord.name === id) return user;
    }
    return false;
}
exports.findInPS = function(user, server, message, sendBy) {
    user = toId(user);
    Bot.forEach(bot => {
        bot.rooms.forEach(room => {
            for (let i in room.users) {
                let uid = room.users[i];
                if (toId(uid) === user) {
                    if(server !== bot.id) {
                        return bot.send(`/pm ${user}, ${message}`); 
                    } else {
                        return 0;
                    }
                }
            }
        });
    });
    let dbUser = getUser(toId(user));
    if(dbUser) {
        if(dbUser.discord.id) {
            if(Discord) {
                Discord.sendDM(dbUser.discord.id, message);
            }
        } else {
            dbUser.inbox.push({
                by: sendBy,
                message: message,
                date: Date.now()
            });
            SaveUsers();
        }
    }
}
exports.commands = {
    register: function (target,room, user) {
        if(!getUser(user.id)) return this.sendReply('LO SENTIMOS, NO TE TENEMOS REGISTRADO');
        if (getUser(user.id).discord.name) return this.sendReply('Ya habias registrado una ID');
        if (!target) return this.sendReply('Especifica una ID a registrar');
        let check = checkRegister(target);
        if(check) return this.sendReply(`La Id que intentas registrar ya se encuentra registrada por el usuario ${chek.name}, si esa es tu ID, contacta a un administrador`);
        getUser(user.id).discord.name = target;
        SaveUsers();
        this.sendReply(`Se ha registrado correctamente la ID ${target}, ahora podras disfrutar de las funciones que tenemos para ti`);
    },
    seen: function(target, room, user) {
        if(!target) return this.sendReply('Especifica a un usuario');
        if(toId(target) === user.id) return this.sendReply('No te has visto en un espejo?');
        let targetProfile = getUser(target);
        if(!targetProfile) return this.sendReply('No tenemos registros del usuario mencionado');
        if(targetProfile.lastSeen) {
            switch(targetProfile.lastSeen.action) {
                case 'TALKING':
                    this.sendReply(`El usuario **${targetProfile.name}** fue visto ${new Date(targetProfile.lastSeen.date).relative('es')} hablando en la sala ${targetProfile.lastSeen.room} del servidor ${targetProfile.lastSeen.server}`);
                    break;
                case 'JOIN':
                    this.sendReply(`El usuario **${targetProfile.name}** fue visto ${new Date(targetProfile.lastSeen.date).relative('es')} entrando a sala ${targetProfile.lastSeen.room} del servidor ${targetProfile.lastSeen.server}`);
                    break;
                case 'LEAVE':
                    this.sendReply(`El usuario **${targetProfile.name}** fue visto ${new Date(targetProfile.lastSeen.date).relative('es')} saliendo de la sala ${targetProfile.lastSeen.room} del servidor ${targetProfile.lastSeen.server}`);
                    break;
            }
        }
    }
}