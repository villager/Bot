const Tools = module.exports = {};

Tools.toId = function(text) {
    if (text && text.id) {
        text = text.id;
    } else if (text && text.userid) {
        text = text.userid;
    } else if (text && text.roomid) {
        text = text.roomid;
    } else if (text && text.username) {
		text = ('' + text).toLowerCase().replace(/[^a-z0-9]+/g, '');
	}
    if (typeof text !== 'string' && typeof text !== 'number') return '';
    return ('' + text).toLowerCase().replace(/[^a-z0-9]+/g, '');
};

Tools.toUserName = function(name) {
	if(name && name.username) {
		name = name.username;
	} 
	return ('' + name).toLowerCase().replace(/[^a-z0-9]+/g, '');
};

Tools.splint = function (target, separator, length) {
	if (!separator) separator = ',';

	let cmdArr = [];
	if (length > 0) {
		let sepIndex = -1;
		for (let count = 0; ; count++) { // jscs:ignore disallowSpaceBeforeSemicolon
			sepIndex = target.indexOf(separator);
			if (count + 1 === length) {
				cmdArr.push(target);
				break;
			} else if (sepIndex === -1) {
				cmdArr.push(target);
				break;
			} else {
				cmdArr.push(target.to(sepIndex));
				target = target.from(sepIndex + 1);
			}
		}
	} else if (length < 0) {
		let sepIndex = -1;
		for (let count = length; ; count++) { // jscs:ignore disallowSpaceBeforeSemicolon
			sepIndex = target.lastIndexOf(separator);
			if (count === -1) {
				cmdArr.unshift(target);
				break;
			} else if (sepIndex === -1) {
				cmdArr.unshift(target);
				break;
			} else {
				cmdArr.unshift(target.from(sepIndex + 1));
				target = target.to(sepIndex);
			}
		}
	} else {
		cmdArr = target.split(separator);
	}
	return cmdArr.map(cmdr => cmdr.trim());
}

Tools.FS = require('../lib/fs').FS;
Tools.Hastebin = require('./hastebin');
Tools.HTML = require('./html');
Tools.toName = function (text) {
	if (!text) return '';
	return text.trim();
};

Tools.escapeHTML = function (str) {
	if (!str) return '';
	return ('' + str)
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;')
		.replace(/\//g, '&#x2f;');
};
Tools.uncacheTree = function(root) {
	let toUncache = [require.resolve(root)];
	do {
		const newuncache = [];
		for (const target of toUncache) {
			if (require.cache[target]) {
				// cachedModule
				const children = require.cache[target].children;
				newuncache.push(
					...(children
						.filter(cachedModule => !cachedModule.id.endsWith('.node'))
						.map(cachedModule => cachedModule.id))
				);
				delete require.cache[target];
			}
		}
		toUncache = newuncache;
	} while (toUncache.length > 0);
};
Tools.generateRandomNick = function(numChars) {
	var chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
	var str = '';
	for (var i = 0, l = chars.length; i < numChars; i++) {
		str += chars.charAt(~~(Math.random() * l));
	}
	return str;
};
Tools.addLeftZero = function(num, nz) {
	let str = num.toString();
	while (str.length < nz) str = "0" + str;
	return str;
};
Tools.getDateString  = function () {
	let date = new Date();
	return (addLeftZero(date.getDate(), 2) + '/' + addLeftZero(date.getMonth() + 1, 2) + '/' + addLeftZero(date.getFullYear(), 4) + ' ' + addLeftZero(date.getHours(), 2) + ':' + addLeftZero(date.getMinutes(), 2) + ':' + addLeftZero(date.getSeconds(), 2));
};