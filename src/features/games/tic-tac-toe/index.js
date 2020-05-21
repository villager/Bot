"use strict";
exports.key = 'Discord';
let ttts = Object.create(null);

const { MessageEmbed } = require('discord.js');

function getCoordinates(coordinates) {
    let x = parseInt(coordinates[0]);
    let y = parseInt(coordinates[1]);
    if(x > 3 && x < 0) return false;
    if(y > 3 && x < 0) return false;
    let point;
    if (x === 1) {
        if(y === 1) point = 1;
        if(y === 2) point = 2;
        if(y === 3) point = 3;
    } else if(x === 2) {
        if(y === 1) point = 4;
        if(y === 2) point = 5;
        if(y === 3) point = 6;
    } else {
        if(y === 1) point = 7;
        if(y === 2) point = 8;
        if(y === 3) point = 9;
    }
    return point;
}
function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
  }
  
class TicTacToe {
    constructor(user) {
        this.p1 = '';
        this.p2 = '';
        this.p3 = '';
        this.p4 = '';
        this.p5 = '';
        this.p6 = '';
        this.p7 = '';
        this.p8 = '';
        this.p9 = '';
        this.x = '';
        this.o = '';
        let isLucky;
        if(getRandomInt(2) === 1) {
            isLucky = (Config.name);
        }  else {
            isLucky = (user);
        }
        if(isLucky === (user)) {
            this.x = isLucky;
            this.o = (Config.name);
        } else {
            this.x = isLucky;
            this.o = (user);
        }
        ttts[toUserName(user)] = this;
    }
    display() {
        return createEmbed(this.x, this.o, this.p1, this.p2, this.p3, this.p4, this.p5, this.p6, this.p7, this.p8, this.p9);
    }
    isAvileable(coordinates) {
        let point = getCoordinates(coordinates);
        console.log(this[`p${point}`].lenght);
        if(this[`p${point}`].lenght) return false;
        return true;
    }
    check(user, coordinates) {
        user = (user);
        let chermark;
        if(user === this.x) {
            chermark = 'X';
        } else {
            chermark = 'O';
        }
        if(this.isAvileable(coordinates)) {
            let posicion = getCoordinates(coordinates);
            this[`p${posicion}`] = chermark;
            return true;
        } else{
            return false;
        }
    }
    setBestMove() {
        
    }
}
function createEmbed(x,o,...args) {
    let fields = [];
    for (const arg of args) {
        fields.push({
            name: '|',
            value: `| ${arg}`,
            inline: true    
        });
    }
    return new MessageEmbed({
        description: `Las X representa a **${x}** y las O representa a **${o}**`,
        title: "LET'S PLAY TIC-TAC-TOE",
        fields: fields,
        color: '#CCC'
    });
}
exports.commands = {
    ttt: {
        '': 'new',
        new:function(target, user, message) {
            if(ttts[toUserName(user)]) return this.sendReply('Ya estabas jugando un ttt conmigo');
            ttts[toUserName(user)] = new TicTacToe((user));
            this.sendReply(ttts[toUserName(user)].display());
            this.sendReply('Lets play!!');
        },
        mark: function(target, user) {
            if(!ttts[toUserName(user)]) return this.sendReply('No tengo ningun juego en curso contigo');
            if(!target) return this.sendReply('Tienes que especificar una cordenada');
            //let args = splint(this.target.toString());
            target =target.split(',');
            if(target[0] > 3 || target[0] < 1) return this.sendReply('La cordenada X no es valida');
            if(target[1] > 3 || target[1] < 1) return this.sendReply('La cordenada Y no es valida');
            ttts[toUserName(user)].check(user, target);
            this.sendReply(ttts[toUserName(user)].display());
        }
    }
};