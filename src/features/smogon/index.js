const psData = require('ps-data');
const { MessageEmbed } = require('discord.js');

exports.initData = false;
exports.key = 'discord';
function getGen(name, num) {
    name = name.toLowerCase();
    let gen;
    if (num > 1) {
        if (num >= 810 || ['gmax', 'galar', 'galar-Zen'].includes(name)) {
            gen = 8;
        } else if (num >= 722 || name.startsWith('alola') || name.endsWith('starter')) {
            gen = 7;
        } else if (name.endsWith('primal')) {
            gen = 6;
        } else if (num >= 650 || name.endsWith('mega')) {
            gen = 6;
        } else if (num >= 494) {
            gen = 5;
        } else if (num >= 387) {
            gen = 4;
        } else if (num >= 252) {
            gen = 3;
        } else if (num >= 152) {
            gen = 2;
        } else {
            gen = 1;
        }
    }
    return gen;
}
function getPokemon(poke) {
    let data = psData.getDex(8)[poke];
    if(!data) return false;
    let abilities = [];
    for (let i in data.abilities) abilities.push(data.abilities[i]);
    return {
        stats: data.baseStats,
        num: data.num,
        name: data.name,
        types: data.types,
        abilities: abilities,
        color: data.color,
        eggs: data.eggGroups,
        evos: data.evos,
        gen: getGen(data.name, data.num),
    }
}
const MAP_COLOR = new Map([
    ['Green', '#00FF76'],
    ['Red', '#FD4040'],
    ['Yellow', '#FCFF00'],
    ['Blue', '#1100FF'],
    ['Purple', '#F000FF'],
    ['Pink', '#FF0087'],
    ['Brown', '#7F6C06'],
    ['Gray', '#CCCCCC'],

]);
const FULL_DETAILS = new Map([
    ['hp', 'Vida'],
    ['def', 'Defensa'],
    ['spe', 'Velocidad'],
    ['spa', 'Ataque Especial'],
    ['atk', 'Ataque'],
    ['spd', 'Defensa Especial'],
]);
function getEmbed(poke) {
    poke = toId(poke);
    let data = getPokemon(poke);
    if(!data) return false;
    let name = data.name.toLowerCase();
    if(name.endsWith('-totem')) {
        name = name.replace('-totem', '');
    }
    let s = data.stats;
    let stats = '';
    for (let i in s) {
         stats+= `${FULL_DETAILS.get(i)} ${s[i]} | `;
    }
    return new MessageEmbed({
        title: `**${data.name} #${data.num}**`,
        thumbnail : {
            width: 100,
            height: 100,
            url: `https://play.pokemonshowdown.com/sprites/gen5/${name}.png`,
        },
        fields: [
            {name: "Habilidades ", value: data.abilities, inline: true},
            {name: "Grupo ", value: data.eggs, inline: true},
            {name: "Evolucion ", value: data.evos ? data.evos : "Ninguna", inline: true},
            {name: "Tipos ", value: (data.types), inline: true},
            {name: "Gen", value: data.gen, inline: true}
        ],
        image: {url: `https://play.pokemonshowdown.com/sprites/ani/${name}.gif`},
        footer: {
            text: stats,
        },
        color: MAP_COLOR.has(data.color) ? MAP_COLOR.get(data.color) : '#FFFFFF',
    })
}
exports.commands = {
    data: function(target) {
        if(!target) return this.sendReply('Necesitas especificar un Pokemon');
        this.sendReply(getEmbed(target));
    }
};