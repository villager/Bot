const psData = require('ps-data');
const { MessageEmbed } = require('discord.js');

exports.initData = false;
exports.key = 'discord';
function getPokemon(poke) {
    let data = psData.getDex(8)[poke];
    if(!data) return false;
    let abilities = [];
    for (let i in data.abilities) abilities.push(data.abilities[i]);
    return {
        name: data.name,
        types: data.types,
        abilities: abilities,
        stats: data.baseStats,
        color: data.color,
        eggs: data.eggGroups,
        evos: data.evos,
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
function getEmbed(poke) {
    poke = toId(poke);
    let data = getPokemon(poke);
    if(!data) return false;
    let name = data.name.toLowerCase();
    if(name.endsWith('-totem')) {
        name =name.replace('-totem', '');
    }
    return new MessageEmbed({
        title: data.name,
        thumbnail : {
            width: 100,
            height: 100,
            url: `https://play.pokemonshowdown.com/sprites/gen5/${name}.png`,
        },
        fields: [
            {name: "Habilidades ", value: data.abilities, inline: true},
            {name: "Grupo ", value: data.eggs, inline: true},
            {name: "Evolucion ", value: data.evos ? data.evos : "Ninguna", inline: true},
            {name: "Tipos ", value: data.types, inline: true},
        ],
        color: MAP_COLOR.has(data.color) ? MAP_COLOR.get(data.color) : '#FFFFFF',
    })
}
exports.commands = {
    data: function(target) {
        if(!target) return this.sendReply('Necesitas especificar un Pokemon');
        this.sendReply(getEmbed(target));
    }
};