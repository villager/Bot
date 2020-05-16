import * as events from 'events';
const EventEmitter = events.EventEmitter;

export class Room extends EventEmitter{
    id: string;
    users: any | object;
    title: string;
    userCount: number;
    constructor(room) {
        super();
        this.id = toId(room);
        this.users = {};
        this.title = room
        this.userCount = 0;
    }
}