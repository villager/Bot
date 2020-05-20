"use stirct";

exports.textInput = function(name, value) {
    return `<input name="${name}" type="text" id="${toId(name)}" ${value ? `value="${value}"` : ""}/>`;
};
exports.sumbitBtn = function(value) {
    return `<input type="submit" name="update" value="${value}" />`;
};
exports.createUL = function(args, isSecond) {
    let buf = `<ul class ="${isSecond ? 'tabs2' : 'tabs'}">`;
    for (const arg of args) {
        if(typeof arg === 'object') {
            if(!arg.id) arg.id = toId(arg.name);
            buf += `<li><a href="#${arg.id}"><span>${arg.name}</span></a></li>`;
        } else {
            buf += `<li><a href="#${toId(arg)}"><span>${arg}</span></a></li>`;
        }
        buf += ``;
    }
    buf += '</ul>';
    return buf;
}