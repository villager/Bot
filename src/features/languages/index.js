"use strict";

let languages = exports.languages = Object.create(null);
class JSONMap extends Map {
    constructor(options) {
        super(options)
    }
	toJSON() {
		return Array.from(this);
	}    
}
const LANG_ALIASES = new JSONMap([
    ['en', 'english'],
    ['es', 'spanish']
])
exports.LANG_ALIASES = LANG_ALIASES;

exports.settingsMenu = function(type) {
    let output = '';
    if(type === 'global') {
        output += `Lenguaje: ${Tools.HTML.textInput('language', Config.language)}<br />`;

    } else if(type === 'discord') {
        output += `Lenguaje: ${Tools.HTML.textInput('language', Discord.language)}<br />`;   

    } else {
        Bot.forEach(bot => {
            if (bot.id === type.id) {
                output += `Lenguaje: ${Tools.HTML.textInput('language', bot.language)} <br />`;
            }
        });        
    }
    return Tools.HTML.createDetails('Lenguaje', output);
}
function validLanguage() {
    let langs = [];
    let languages = LANG_ALIASES.toJSON();
    for (const lang of languages) langs.push(lang[0]);
    return new Set(langs);
}
function settingsValidation() {
    let buf = '';
    buf += `\n\t\t/** VALIDACION DE LENGUAJES **/`;
    buf += `\n\t\tvar language = document.getElementById('language');`;
    buf += `\n\t\tif(language && language !== 'es' && language !== 'en') alert('El lenguaje que tratas de ingresar no es valido');\n`;
    return buf;
}
exports.settingsValidation = settingsValidation;

function onUpdate(post) {
    if(post.update && validLanguage().has(post.language)) {
        if(post.update === 'global') {
            Config.language = post.language;
            Features('settings').update('global', {language:post.language});
        } else if(post.update === 'discord') {
            Discord.plugins.language = post.language; 
            Features('settings').update('discord', {language:post.language});
        } else {
            Bot.forEach(bot => {
                if(bot.id === post.update) {
                    bot.language = post.language;
                    Features('settings').update(bot.id, {language:post.language});
                }
            });
        }
    }
}
exports.init = function() {
    Features.eventEmitter.on('onUpdate', onUpdate);
    let languagesDir = Tools.FS('./features/languages').readdirSync();
    for (const language of languagesDir) {
        if(Tools.FS(`./features/languages/${language}`).isFileSync()) continue;
        loadLanguage(language);
    }
}
function loadLanguage(language) {
    let fileList = Tools.FS(`./features/languages/${language}`).readdirSync();
    if(!languages[language]) languages[language] = {};
    for (const file of fileList) {
        let langPath = require(`./${language}/${file.slice(0, -3)}`);
        if(langPath.translations) {
            Object.assign(languages[language], langPath.translations);
        }
    }
}
function getLangMsg(lang, msg) {
    let language = lang;
    if(!languages[toId(lang)]) {
        if(LANG_ALIASES.has(toId(lang))) language = LANG_ALIASES.get(toId(lang));
    }
    if(!languages[language]) throw Error(`Lenguaje ${language} no existe`);
    if(!languages[language][msg]) throw Error(`Mensaje ${msg} no existe en ${language}`);
    return languages[language][msg];
}
exports.getLangMsg = getLangMsg;
exports.get = getLangMsg;