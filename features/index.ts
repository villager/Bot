export const features = Object.create(null);
import * as path from 'path';
import * as util from 'util';

function getFeature(feature) {
    if(!features[feature]) return false;
    return features[feature];
}
export function loadFeatures() {
    let featureList = Tools.FS('./features/').readdirSync();
    for (const featureDir of featureList) {
        if(!Tools.FS(`./features/${featureDir}`).isDirectorySync()) continue;
        const feature = require(`./${featureDir}`);
        if(!feature.id) feature.id = featureDir; // Si no hay uno especificado, sera su nombre de carpeta
        features[feature.id] = feature;
        if(!features[feature.id].origin) features[feature.id].origin = featureDir;
    } 
  //  if(Config.initData) initData();
}
export function initData() {
    const DATA_FOLDERS = ['data'];
	forEach(feature => {
        if(typeof feature.initData === 'function') {
            feature.initData();
        }
        for (const folder of DATA_FOLDERS) {
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
                let baseFileName = `./features/${feature.origin}/${folder}/${fileData.name}`;
                let originFileName = `./features/${feature.origin}/${folder}/${fileData.name}`;
                Tools.FS(`${baseFileName}${fileData.ext}`).isFile().catch(() =>{
                    console.log(`Creando archivo ${baseFileName}`);
                    Tools.FS(`${baseFileName}${fileData.ext}`).writeSync(Tools.FS(`${originFileName}-example${fileData.ext}`).readSync());

                })
            }
        }
    });
}
export function forEach(callback: any, thisArg?:any) {
	return Object.values(features).forEach(callback, thisArg);
}
export function init(server?: any) {
    forEach((feature) => {
        if(typeof feature.init === 'function') {
            feature.init(server);
        } 
        if (feature.commands && typeof feature.commands === 'object') {
            Object.assign(Chat.psCommands, feature.commands);
        }
    });
}
export function parse(server:any, room:string, message:any, isIntro:Boolean, spl:any) {
    forEach((feature) => {
        if(typeof feature.parse === 'function') {
            feature.parse(server, room, message, isIntro, spl);
        }
    })
}
export function initCmds(server: any) {
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
    forEach((feature) => {
        if (typeof feature.initCmds === 'function') {
            let featureCmds = feature.initCmds();
            if(Array.isArray(featureCmds) && featureCmds.length > 0) {
                cmds = cmds.concat(feature.initCmds());
            }
        }
    });
    return cmds;
}
export const get = getFeature;