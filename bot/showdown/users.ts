
import * as events from 'events';

const EventEmitter = events.EventEmitter;
export class User extends EventEmitter {
    id: string;
    name: string;
    lastSeen: Date|number;
    constructor(user) {
        super();
        this.id = toId(user);
        this.name = user;
        this.lastSeen = 0;
    }
}