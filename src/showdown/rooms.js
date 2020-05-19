"use strict";

const EventEmitter = require('events').EventEmitter;

class Room extends EventEmitter{
    constructor(room) {
        super();
        this.id = toId(room);
        this.users = {};
        this.title = room
        this.userCount = 0;
    }
}
module.exports = Room;