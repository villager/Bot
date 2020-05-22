"use strict";

const pathModule = require('path');
const ROOT_PATH = pathModule.resolve(__dirname, '..');
let roomLang = Object.create(null);

exports.key = 'showdown';

class JSONMap extends Map {
    constructor(options) {
        super(options)
    }
	toJSON() {
		return Array.from(this);
	}    
}
const LANG_LIST = new Set(['en', 'es']);
const SPANISH_ALIASES = new Set(['es', 'spanish', 'español', 'espaol', 'espanol']);
const ENGLISH_ALIASES = new Set(['en', 'ing', 'ingles', 'us', 'uk', 'english']);

const LANG_ALIASES = new JSONMap([
    ['en', 'english'],
    ['es', 'spanish']
])


class  LoadLang {
    constructor(path) {
        if(!path) path = './base-lang.json';
		this.path = pathModule.resolve(ROOT_PATH, path);
        this.translations = Object.create(null);
        this.path = path;
    }
    load() {
        let langPackage = require(this.path);
        for (let i in langPackage) {
            this.translations[i] = langPackage[i];
        }
    }
    get(lang, msg) {
        let language = lang;
        this.load();
        if(!this.translations[toId(lang)]) {
            if(LANG_ALIASES.has(toId(lang))) language = LANG_ALIASES.get(toId(lang));
        }
        if(!this.translations[language]) throw Error(`Lenguaje ${language} no existe`);
        if(!this.translations[language][msg]) throw Error(`Mensaje ${msg} no existe en ${language}`);        
        return this.translations[language][msg];
    }
    getSub (lang, msg, sub) {
        return this.get(lang, msg)[sub];
    }
    replaceSub(lang, msg, sub, ...args) {
        let i = 1;
        let output = this.get(lang, msg)[sub];
        for (const arg of args) {
            output = output.replace(`$${i}`, arg);
            i++;
        }
        return output;
    }
    replace(lang, msg, ...args) {
        let i = 1;
        let output = this.get(lang, msg);
        for (const arg of args) {
            output = output.replace(`$${i}`, arg);
            i++;
        }
        return output;
    }
}
function loadLang(langPath) {
    return new LoadLang(langPath);

};
exports.load = loadLang;

exports.loadHelp = function() {
    return new LoadLang('./helps.json');
};

exports.settingsMenu = function(type) {
    let output = '';
    if(type === 'discord') {
        output += `Lenguaje: ${Tools.HTML.textInput('language', Discord.language)}<br />`;   
        return Tools.HTML.createDetails('Lenguaje', output);
    } else {
        let returned = '';
        Bot.forEach(bot => {
            if (bot.id === type.id) {
                output += `Lenguaje: ${Tools.HTML.textInput('language', bot.language)} <br />`;
                returned = Tools.HTML.createDetails('Lenguaje', output);
            }
        });     
        return returned;   
    }
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

function onUpdate(post) {
    if(post.update && validLanguage().has(post.language)) {
        if(post.update === 'discord') {
            Discord.language = post.language; 
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
};
exports.LANG_ALIASES = LANG_ALIASES;
exports.settingsValidation = settingsValidation;
const Lang = loadLang();
exports.commands = {
    language: function(target, room) {
        if(!this.can('invite', true)) return false;
        if(!target) return this.sendReply(Lang.getSub(this.lang, 'language', 'target'));
        if(!LANG_LIST.has(target) && !SPANISH_ALIASES.has(target) && !ENGLISH_ALIASES.has(target)) {
            return this.sendReply(Lang.getSub(this.lang, 'language', 'unavileable'));
        }
        if(SPANISH_ALIASES.has(target)) {
            if(room.language === 'es') return this.sendReply(Lang.getSub(this.lang, 'language', 'alr_es'));
            this.sendReply(Lang.getSub(this.lang, 'language', 'now_es'));
            room.language = 'es';
        }
        if(ENGLISH_ALIASES.has(target)) {
            if(room.language === 'en') return this.sendReply(Lang.getSub(this.lang, 'language', 'alr_en'));
            this.sendReply(Lang.getSub(this.lang, 'language', 'now_en'));
            room.language = 'en';            
        }
    }
}