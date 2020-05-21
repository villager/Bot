"use strict";

const Games = require('../');

exports.key = ['showdown', 'discord'];


class PTB {
    constructor(room, options = {}) {
        this.players = Object.create(null);   
        this.host = options.host;
        this.maxPlayers = options.maxPlayers;
        this.action = null;
        this.turn = 0;
        this.hasBomb = null;
        this.started = false;
        Games[room] = this;
    }
}