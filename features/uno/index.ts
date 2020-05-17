/**
 * Space Showdown 
 * Modulo del Bot encargado de hacer que juegue al juego del UNO 
 */
export const key = 'showdown';
export const initData = false; // Solucionar esto despues

let games = Object.create(null);

class UNO {
    server: any;
    room: string;
    cards: any;
    players: any;
    maxCap: any;
    ptod: number;
    currentTurn: string | null;
    winner: string | null;
    phase: string;
    constructor(server, room) {
        this.room = toId(room);
        this.cards = [];
        this.players = {};
        this.server = server;
        this.ptod = 0;
        this.currentTurn = null;
        this.phase = 'signups'
        this.winner = null;
        games[toId(room)] = this;
    }
    send(data: string) {
        this.server.send(data, this.room);
    }
    join() {
        this.send('/uno join');
    }
    joinUser(user: string) {
        if(this.players[toId(user)]) return false;
        this.players[toId(user)] = {
            cardsCount: 0,
        }
    }
    leaveUser(user: string) {
        if(!this.players[toId(user)]) return false;
        delete this.players[toId(user)];
    }
    onWinner(user: string) {}
    selfTurn(data:any) {}
    onTurn(data:any) {}
}
export function getGame(room: string) {
    if(!games[room]) return false;
    return games[room];
}
export function parse(server:any, room:string, message:any, isIntro:Boolean, spl:any) {
    if(spl[0] === 'queryresponse' && spl[1] === 'uno') {
        if(server.id === 'moonlight') console.log(spl);
        switch(spl[2]) {
            case 'signups': 
                games[room] = new UNO(server, room);
                games[room].join();                
            break;
            case 'joined': 
                games[room].joinUser(spl[3]);
            break;
            case 'dq':
            case 'leave':
                games[room].leaveUser(spl[3]);
            break;
            case 'start':
                games[room].phase = 'playing';
            break;
            case 'turn': 
                games[room].onTurn(spl[3]);
            break;
            case 'self-turn':
                games[room].selfTurn(spl[3]);
            break;
            case 'winner':
                games[room].onWinner(spl[3]);
            break;
            case 'action':
                games[room].onAction(spl[3]);
                break;
            case 'end':
                delete games[room];
            break;
        }
    } 
}
export const commands = {
    uno: function(target, room) {
        if(!target) target = '';
        this.sendReply(`/uno new ${target}`);
    }
};