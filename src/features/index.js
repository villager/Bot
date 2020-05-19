"use strict";
const path = require('path');

let features = Object.create(null);

function getFeature(feature) {
    if(!features[feature]) return false;
    return features[feature];
}
let Features = module.exports = getFeature;

Features.loadFeatures = function() {
    let featureList = Tools.FS('./features/').readdirSync();
    for (const featureDir of featureList) {
        if(!Tools.FS(`./features/${featureDir}`).isDirectorySync()) continue;
        const feature = require(`./${featureDir}`);
        if(!feature.id) feature.id = featureDir; // Si no hay uno especificado, sera su nombre de carpeta
        features[feature.id] = feature;
        if(!features[feature.id].origin) features[feature.id].origin = featureDir;
    } 
    if(Config.initData) Features.initData();
};

Features.initData = function() {
    const DATA_FOLDERS = ['data'];
	Features.forEach(feature => {
        if(typeof feature.initData === 'function') {
            feature.initData();
        }
        for (const folder of DATA_FOLDERS) {
            if (feature.initData === false) continue;
            let fileList = Tools.FS(`./features/${feature.origin}/${folder}`).readdirSync();
            
            let fileDict = Object.create(null);
            let exampleFiles = [];
            for (let fileName of fileList) {
                let ext = path.extname(fileName);
                if (ext !== '.json' && ext !== '.js' && ext !== '.txt' && ext !== '.tsv' && ext !== '.csv' && ext !== '.pem') continue;
                let name = fileName.slice(0, -ext.length);
                if (!fileDict[name]) fileDict[name] = Object.create(null);
                fileDict[name][ext] = 1;
                if (name.slice(-8) === '-example') exampleFiles.push({name: name.slice(0, -8), ext: ext});
            }
            for (let fileData of exampleFiles) {
                let baseFileName = `../src/features/${feature.origin}/${folder}/${fileData.name}`;
                let originFileName = `../src/features/${feature.origin}/${folder}/${fileData.name}`;
                Tools.FS(`${baseFileName}${fileData.ext}`).isFile().catch(() =>{
                    console.log(`Creando archivo ${baseFileName}`);
                    Tools.FS(`${baseFileName}${fileData.ext}`).writeSync(Tools.FS(`${originFileName}-example${fileData.ext}`).readSync());

                })
            }
        }
    });
}
Features.forEach = function(callback, thisArg) {
	return Object.values(features).forEach(callback, thisArg);
}
const COMMANDS_MAP = new Map([
    ['showdown', 'psCommands'],
    ['discord', 'discordCommands'],
    ['global', 'globalCommands'],
]);
Features.init = function(server) {
    Features.forEach((feature) => {
        if(typeof feature.init === 'function') {
            feature.init(server);
        } 
        if(feature.key && !Array.isArray(feature.key)) {
            if (feature.commands && typeof feature.commands === 'object') {
                Object.assign(Chat[COMMANDS_MAP.get(feature.key)], feature.commands);
            }            
        } else if(feature.key) {
            for (const key of feature.key) {
                if(feature[COMMANDS_MAP.get(key)] && typeof feature[COMMANDS_MAP.get(key)] === 'object') {
                    Object.assign(Chat[COMMANDS_MAP.get(key)], feature[COMMANDS_MAP.get(key)]);
                } 
            }
        }
    });
}
Features.parse = function(server, room, message, isIntro, spl) {
    Features.forEach((feature) => {
        if(typeof feature.parse === 'function') {
            feature.parse(server, room, message, isIntro, spl);
        }
    });
}
Features.initCmds = function(server) {
    let cmds = [];
    /**
     * Global Init Commands
     */
    if(Array.isArray(Config.initCmds) && Config.initCmds.length > 0) {
        cmds = cmds.concat(Config.initCmds);
    }
    /**
     * Server Init Commands
     */
    if(Config.servers[server.id].initCmds) {
        if(Array.isArray(Config.servers[server.id].initCmds) && Config.servers[server.id].initCmds.length > 0) {
            cmds = cmds.concat(Config.servers[server.id].initCmds);
        }
    }
    /**
     * Feature Init Commands
     */
    Features.forEach((feature) => {
        if (typeof feature.initCmds === 'function') {
            let featureCmds = feature.initCmds();
            if(Array.isArray(featureCmds) && featureCmds.length > 0) {
                cmds = cmds.concat(feature.initCmds());
            }
        }
    });
    return cmds;
}
Features.get = getFeature;