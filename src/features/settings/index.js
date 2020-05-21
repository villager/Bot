"use strict";
let users = Object.create(null);
let settings = Object.create(null);
exports.settings = settings;
const http = require('http');
const util = require('util');
const crypto = require('crypto');
const SETTINGS_PATH = './features/settings/';
const LOGIN_USERS_PATH = `${SETTINGS_PATH}data/login.json`;
const SETTINGS_JSON_PATH = `${SETTINGS_PATH}data/settings.json`;
let loginUsers = Object.create(null);


Config.settingsLogin = {
    user: "admin", 
    pass: "admin"
};
let qs = require('querystring');
Config.bindaddress = '0.0.0.0';
const saveSettings = exports.save = () => Tools.FS(SETTINGS_JSON_PATH).writeUpdate(() => JSON.stringify(settings));
function parseCookies (request) {
	var list = {}, rc = request.headers.cookie;
	if (rc) rc.split(';').forEach(function (cookie) {
		var parts = cookie.split('=');
		list[parts.shift().trim()] = decodeURI(parts.join('='));
	});
	return list;
}
function deleteCookies(request) {
    rc = request.headers.cookie;
    if(rc) console.log(rc);
}
function updateSettings(id, data) {
    id = toId(id);
    if(!settings[id]) settings[id] = {};
    Object.assign(settings[id], data)
    saveSettings();
}
exports.update = updateSettings;
function generateValidation() {
    let buf = '';
    Features.forEach(feature => {
        if(typeof feature.settingsValidation === 'function') {
            buf += feature.settingsValidation();
        }
    });
    return buf;
}
function encrypt(text){
    let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from('passwordpasswordpasswordpassword'), Buffer.from('vectorvector1234'))
    let crypted = cipher.update(text, 'utf8', 'hex');
    crypted += cipher.final('hex');
    return crypted;
}
function decrypt(text){
    let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from('passwordpasswordpasswordpassword'), Buffer.from('vectorvector1234'))
    let dec = decipher.update(text, 'hex', 'utf8');
    dec += decipher.final('utf8');
    return dec;
}
function generateArticle(id, out) {
    id = toId(id);
    let output = `<div class="secciones"><article id="${id}">`;
    output += `<form action="" method="post" name="form${id}" target="_self" id="form${id}">`;
    output += out;
    output += `</form>`;
    output += '</article></div>';
    return output;
}

class Settings {
    constructor() {
        this.settings = {};
        this.port = 8080;
        this.bindaddress = Config.bindaddress;
        this.curUser = null;
    }
    listen() {
		let server = this.server = http.createServer(this.handleRequest.bind(this));
		setTimeout(() => {
			server.listen(this.port, this.bindaddress);
			console.log("Settings Server Listening at " + (this.bindaddress || "localhost") + ":" + this.port);
		}, 1000);
    }
    log(txt) {console.log(txt)}
    handleRequest (request, response) {

		request.on('error',  err => {
			this.log("Request error: " + util.inspect(err));
		});
		response.on('error', err => {
			this.log("Respose error: " + util.inspect(err));
		});
        let cookies = parseCookies(request);
		let secToken = cookies['accesstoken'];
		let acs = this.checkToken(secToken);
		if (request.method === 'POST') {
			let body = '';
			request.on('data', data => {
				body += data;
				if (body.length > 1e6) request.connection.destroy();
			});
			request.on('end', () => {
                let post = qs.parse(body);
                if (post.update) {
                    this.updateServer(post);
                    this.finishResponse(request, response, acs, post);
                } else if (post.logout) {
					if (acs.user) {
						this.logout(secToken);
						this.finishResponse(request, response, 'none', post);
					}
				} else {
                    let token;
                    if(post.resetpassword) {
                        token = this.login(post.id, post.password2);
                    } else {
                        token = this.login(post.user, post.password);
                    }
					if (token) {
						this.finishResponse(request, response, token, post);
					} else {
						this.finishResponse(request, response, token, post);
					}
				}
			});
			return;
		}
		this.finishResponse(request, response, secToken);
    }
    updateServer(post) {
        Features.eventEmitter.emit('onUpdate', post, settings).flush();
        saveSettings();
    }
    onResponse(response, output, setToken) {
		let HTML_HEAD = {'Content-Type': 'text/html; charset=utf-8'};
		if (setToken) {
			HTML_HEAD['Set-Cookie'] = 'accesstoken=' + setToken + "; Path=/";
		}
		response.writeHead(200, HTML_HEAD);
		response.write(output);
		response.end();
	}
    generateSections() {
        let options = [];
        Bot.forEach(bot => {
            options.push({name: bot.id});
        });
        if(Discord) {
            options.push({name: 'Discord'});
        }
        options.push({name: "Global"});
        return Tools.HTML.createUL(options);
    }
    generateContent() {
        let output = '';
        Bot.forEach(bot => {
            let inout = ''
            inout += `Nombre del Bot ${bot.name}<br />`;
            Features.forEach(feature => {
                if(typeof feature.settingsMenu === 'function') {
                    let fun = feature.settingsMenu(bot);
                    if(fun !== undefined) inout += `<br />${feature.settingsMenu(bot)}`;
                }
            });
            inout += '<br />';
            inout += Tools.HTML.sumbitBtn(bot.id);
            output += generateArticle(bot.id, inout);
        });
        if(Discord) {
            let inout = `Nombre del Bot ${Discord.name}<br />`;
            Features.forEach(feature => {
                if(typeof feature.settingsMenu === 'function') {
                    let fun = feature.settingsMenu('discord');
                    if(fun !== undefined) inout += `<br />${fun}`;
                }
            });
            inout += '<br />';
            inout += Tools.HTML.sumbitBtn('discord');
            output += generateArticle('Discord', inout);
        }
        let globalOutput = ``;
        globalOutput += '<br />';
        Features.forEach(feature => {
            if(typeof feature.settingsMenu === 'function') {
                let fun = feature.settingsMenu('global');
                if (fun !== undefined) globalOutput +=  `<br />${fun}`;
            }
        });
        globalOutput += '<br /><br />';
        globalOutput += Tools.HTML.sumbitBtn('global');
        output += generateArticle('Global', globalOutput);
        return output;
    }
    finishResponse (request, response, secToken, post) {
		let url = request.url;
		let ip = request.connection.remoteAddress;
        let output = '';
        output = Tools.FS(`${SETTINGS_PATH}templates/login.html`).readSync().toString();
        if(!url || url == '/') {
            if (secToken) {

                let ConfigTokens = Config.settingsLogin;
                // First Login
                this.curUser = post.user;
   /*
                if (Object.keys(loginUsers).length < 1 && ConfigTokens.pass == secToken.pass) {
                    output = Tools.FS(`${SETTINGS_PATH}templates/reset-password.html`).readSync().toString().replace('${USER_NAME}', secToken.user);
                    loginUsers[toId(this.curUser)] = {
                        name: this.curUser,
                        id: toId(this.curUser),
                        pass: encrypt(secToken.pass)
                    };
                    console.log(decrypt(loginUsers[toId(secToken.user)].pass));
                    Tools.FS(LOGIN_USERS_PATH).writeUpdate(() => JSON.stringify(loginUsers));
                    console.log(loginUsers);
                } else {
                    */
                   output = Tools.FS(`${SETTINGS_PATH}templates/home.html`).readSync().toString();
                   output = output.replace('${TAB_SECTIONS}', this.generateSections());
                   output = output.replace('${CONTENT_SECTIONS}', this.generateContent());
                   output = output.replace('${FEATURE_VALIDATION}', generateValidation());
               // }
            }

        } else {
        }
        this.onResponse(response, output, secToken);
    }
    login(user ,pass) {
        let loginOpts;
        user = toId(user);
        // Just one login
        if(!loginUsers[user]) return false;
        loginOpts = loginUsers[user];
        if(decrypt(loginOpts.pass) === pass) {
            return loginOpts;
        } 
        return false;
    }
    checkToken (token) {
		let acs = {
			user: 'admin',
			denied: false,
		};

		return acs;
	}
}
exports.init = function() {
    const server = new Settings();
    server.listen();
    loginUsers = JSON.parse(Tools.FS(LOGIN_USERS_PATH).readSync().toString());
    settings = JSON.parse(Tools.FS(SETTINGS_JSON_PATH).readSync().toString());
    for (let i in settings) {
        switch (i) {
            case 'discord':
                for (let x in settings[i]) {
                    Object.assign(Discord, settings[i][x]);
                }
                break;
            case 'global':
                for (let x in settings[i]) {
                    Config[x] = settings[i][x];
                }
                break;
            default: {
                Bot.forEach(bot => {
                    if(bot.id === i) {
                        for (let x in settings[i]) {
                            Object.assign(bot, settings[i][x]);
                        }
                    }
                });
            }
        }
    }  
};
exports.get = function (id) {
    if(!settings[id]) return false;
    return settings[id];
}