"use strict";

const EventEmitter = require('events').EventEmitter;
class User extends EventEmitter {

    constructor(user) {
        super();
        this.id = toId(user);
        this.name = user;
        this.lastSeen = 0;
    }
}
module.exports = User;