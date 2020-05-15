
import * as https from "https";

export function upload(toUpload: any, callback: any) {
	let reqOpts = {
		hostname: "hastebin.com",
		method: "POST",
		path: '/documents'
	};
	let req = https.request(reqOpts, function (res) {
		res.on('data', function (chunk) {
			try {
				let linkStr = "hastebin.com/" + JSON.parse(chunk.toString())['key'];
				if (typeof callback === "function") callback(true, linkStr);
			} catch (e) {
				if (typeof callback === "function") callback(false, e);
			}
		});
	});
	req.on('error', function (e) {
		if (typeof callback === "function") callback(false, e);
	});
	req.write(toUpload);
	req.end();
}
export function download(key: any, callback: any) {
	if (typeof callback !== "function") throw new Error("callback must be a function");
	let url = 'https://hastebin.com/raw/' + key;
	https.get(url, response => {
		let data = '';
		response.on('data', chunk => {
			data += chunk;
		});
		response.on('end', () => {
			callback(data);
		});
		response.on('error', err => {
			callback(null, err);
		});
	}).on('error', err => {
		callback(null, err);
	});
}