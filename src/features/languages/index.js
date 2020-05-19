"use strict";

let languages = exports.languages = Object.create(null);
const LANG_ALIASES = new Map([
    ['en', 'english'],
    ['es', 'spanish']
])
exports.initData = false;
exports.init = function() {
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