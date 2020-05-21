"use strict";
const path = require('path');

let features = Object.create(null);

function getFeature(feature) {
    if(!features[feature]) return false;
    return features[feature];
}
let Features = module.exports = getFeature;
Features.features = features;
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
            Tools.FS(`./features/${feature.origin}/${folder}`).readdir().then(files => {
                let fileDict = Object.create(null);
                let exampleFiles = [];
                for (let fileName of files) {
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
            }).catch(() => {});
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
Features.loadPlugins = function() {
    Features.forEach(feature => {
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
Features.init = function(server) {
    Features.forEach((feature) => {
        if(typeof feature.init === 'function') {
            feature.init(server);
        } 
    });
    Features.loadPlugins();
}

Features.parse = function(server, room, message, isIntro, spl) {
    Features.forEach((feature) => {
        if(typeof feature.parse === 'function') {
            feature.parse(server, room, message, isIntro, spl);
        }
    });
}
const events = require('./events');
Features.eventEmitter =  new events.EventEmitter();

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