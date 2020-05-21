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
        this.discordId = false;
        this.name = user;
        this.group = '';
        this.lastSeen = {
            date: Date.now(),
            action: null,
            server: false,
            room: null,
        };
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
}
function getUser(user) {
    if(!user) return false;
    if(!users[toUserName(user)]) return false;
    return users[toUserName(user)];
}
exports.get = getUser;
function findByDiscord(discordId) {
    for (let i in users) {
        if(toId(users[i].discordId) === toUserName(discordId)) return users[i];
    }
    return false;
}

exports.findDiscord = findByDiscord;
exports.isRegistered = function(user) {
    user = toId(user);
    if (!findByDiscord(user)) return false;
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
        if(user.discordId === id) return user;
    }
    return false;
}
exports.commands = {
    register: function (target,room, user) {
        if(!getUser(user.id)) return this.sendReply('LO SENTIMOS, NO TE TENEMOS REGISTRADO');
        if (getUser(user.id).discordId) return this.sendReply('Ya habias registrado una ID');
        if (!target) return this.sendReply('Especifica una ID a registrar');
        let check = checkRegister(target);
        if(check) return this.sendReply(`La Id que intentas registrar ya se encuentra registrada por el usuario ${chek.name}, si esa es tu ID, contacta a un administrador`);
        getUser(user.id).discordId = target;
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