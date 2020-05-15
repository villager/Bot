export function toId(text: any) {
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
}
export function toUserName(name : any) {
	if(name && name.username) {
		name = name.username;
	} 
	return ('' + name).toLowerCase().replace(/[^a-z0-9]+/g, '');

}
export function splint (target: any, separator:string, length: number) {
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
	return cmdArr.map('trim');
}
import * as fsPath from '../lib/fs';
import * as Bin from './hastebin';

export const FS = fsPath.FS;
export const Hastebin = Bin;

export function toName (text: any) {
	if (!text) return '';
	return text.trim();
}

export function escapeHTML(str:any) {
	if (!str) return '';
	return ('' + str).escapeHTML();
};