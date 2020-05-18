import { isNumber } from "util";

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
    top: string;
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
    bestColorByHand(hand:any) {
        let originalColors = ['R', 'G', 'Y', 'B', 'W'];
        let colors = [];
        for (const color of originalColors) {
            colors.push({
                color: color,
                count: 0,
            });
        }
        for (const card of hand) {
            switch(card.charAt(0)) {
                case 'R':
                    colors[0].count++;
                break;
                case 'G':
                    colors[1].count++;
                break;
                case 'Y':
                    colors[2].count++
                break;
                case 'B':
                    colors[3].count++;
                break;
                case 'W':
                    colors[4].count++;
                break;
            }
        }
        let sortColor = colors.sort((a,b)=>a.count-b.count);
        let returnColor = 'B';
        for (const color of colors) {
            if(sortColor[4] === color.count) returnColor = color.color;
        }
        if(returnColor === 'W') {
            returnColor = sortColor[3].color;
        }
        console.log(returnColor);
        return returnColor;
    }
    playValidate(hand:any) {
        let topValue = this.top.slice(1);
        let topColor = this.top.charAt(0);
        for (const card of hand) {
            let cardColor = card.charAt(0);
            let cardValue = card.slice(1);
            if(cardColor === topColor || (cardValue === topValue && topValue !== '+4')) {
                return card;
            }
        }
        // Looking for the wilds
        for (const card of hand) {
            if(card.charAt(0) === 'W') {
                return `${card} ${this.bestColorByHand(hand)}`;
            }
        }
        return false;
    }
    onDraw(data:any) {
        data = JSON.parse(data);
        this.top = data.top;
        let validateHand = this.playValidate(data.hand);
        if(!validateHand) return this.send(`/uno pass`);
        return this.send(`/uno play ${validateHand}`);

    }
    onWinner(user: string) {
        delete games[this.room];
    }
    selfTurn(data:any) {
        data = JSON.parse(data);
        this.top = data.top;
        let validateHand = this.playValidate(data.hand);
        if(!validateHand) return this.send('/uno draw');
        return this.send(`/uno play ${validateHand}`);
    }
    onTurn(data:any) {
        this.currentTurn = data;
    }
}
export function getGame(room: string) {
    if(!games[room]) return false;
    return games[room];
}
function checkIsActive(server, room) {
    if(games[room]) return games[room];
    else {
        games[room] = new UNO(server, room);
        return games[room];
    }
}
export function parse(server:any, room:string, message:any, isIntro:Boolean, spl:any) {
    if(spl[0] !== 'uhtml' && spl[0] !== 'uhtmlchange') console.log(message);
    if(spl[0] === 'queryresponse' && spl[1] === 'uno') {
        let game = games[room];
        switch(spl[2]) {
            case 'signups': 
                checkIsActive(server, room).join();                
            break;
            case 'joined': 
                checkIsActive(server, room).joinUser(spl[3]);
            break;
            case 'dq':
            case 'leave':
                checkIsActive(server, room).leaveUser(spl[3]);
            break;
            case 'start':
                checkIsActive(server, room).phase = 'playing';
            break;
            case 'turn': 
                checkIsActive(server, room).onTurn(spl[3]);
            break;
            case 'self-turn':
                console.log(spl[3]);
                checkIsActive(server, room).selfTurn(spl[3]);
            break;
            case 'draw':
                checkIsActive(server, room).onDraw(spl[3]);
            case 'winner':
                checkIsActive(server, room).onWinner(spl[3]);
            break;
            case 'action':
                checkIsActive(server, room).onAction(spl[3]);
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