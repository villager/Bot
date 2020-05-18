/**
 * Space Showdown 
 * Modulo del Bot encargado de hacer que juegue al juego del UNO 
 */
export const key = 'showdown';

const AUTO_JOIN_PATH = './features/uno/data/autojoin.json';
const ACTION_COOLDOWN = 1000 * 3;
let games = Object.create(null);
let autoJoin = Object.create(null);

export function init() {
    for (let i in games) {
        delete games[i];
    }
    autoJoin = JSON.parse(Tools.FS(AUTO_JOIN_PATH).readSync().toString());

}
function bubbleSort(arr: any){
    for(let i=1;i<arr.length;i++) {
        for(let j=0;j<(arr.length-i);j++) {
            if(arr[j].count>arr[j+1].count) {
                let aux=arr[j+1];
                arr[j+1]=arr[j];
                arr[j]=aux;
            }
        }
    }
    return arr;
}
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
    change: string;
    action: any;
    constructor(server, room) {
        this.room = toId(room);
        this.cards = [];
        this.players = {};
        this.server = server;
        this.ptod = 0;
        this.currentTurn = null;
        this.phase = 'signups'
        this.winner = null;
        this.change = null;
        this.action = null;
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
 
    bestColorByHand(hand: any) {
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
        colors = bubbleSort(colors)
        let returnColor = colors[4].color;
        if(colors[4].color === 'W') {
            returnColor = colors[3].color;
        }
        return returnColor;
    }
    playValidate(hand:any) {
        let topValue = this.top.slice(1);
        let topColor = this.top.charAt(0);
        for (const card of hand) {
            let cardColor = card.charAt(0);
            let cardValue = card.slice(1);
            if (topColor === 'W') {
                if(this.change === cardColor) {
                    return card;
                }
            } else {
                if(cardColor === topColor || (cardValue === topValue)) {
                    return card;
                }              
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
        this.action = setTimeout(() => {
            if(!validateHand) {
                this.send(`/uno pass`);
            } else {
                this.send(`/uno play ${validateHand}`);
            }
            clearTimeout(this.action);
        }, ACTION_COOLDOWN);
        return this.action;

    }
    onWinner(user: string) {
        delete games[this.room];
    }
    selfTurn(data:any) {
        data = JSON.parse(data);
        this.top = data.top;
        this.change = data.change;
        let validateHand = this.playValidate(data.hand);
        this.action = setTimeout(() => {
            if(!validateHand) {
                this.send('/uno draw');
            } else {
                this.send(`/uno play ${validateHand}`);
            }
            clearTimeout(this.action);
        }, ACTION_COOLDOWN);

        return this.action;
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
    if(spl[0] === 'queryresponse' && spl[1] === 'uno' && autoJoin[room]) {
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
    },
    joinunos: function(target, room) {
        if(!target) target = 'on';
        if(target == 'on') {
            if(autoJoin[room]) return this.sendReply('Ya estaba inscrito para los juegos de UNO');
            autoJoin[room] = 1        
            this.sendReply('A partir de ahora me unire a todos los juegos de UNO de la sala');
        } else if(target == 'off') {
            if(!autoJoin[room]) return this.sendReply('No estaba inscrito para los juegos de esta sala');
            delete autoJoin[room];
            this.sendReply('A partir de ahora ya no unire a los juegos de UNO de la sala');
        } else {
            return this.sendReply('No es una opcion valida (on/off)');
        }
        Tools.FS(AUTO_JOIN_PATH).writeUpdate(() => JSON.stringify(autoJoin));
    },
};