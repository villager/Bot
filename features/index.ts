export const features = Object.create(null);

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
    } 
}
export function forEach(callback: any, thisArg?:any) {
	return Object.values(features).forEach(callback, thisArg);
}
export function init(server?: any) {
    forEach((feature) => {
        if(typeof feature.init === 'function') {
            feature.init(server);
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