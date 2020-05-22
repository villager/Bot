const Lang = Features('languages').load();

exports.commands = {
    '?': 'help',
    h: 'help',
    help: function(target, user) {
		target = target.toLowerCase();

		// overall
		if (!target || target === 'help') {
			this.sendReply(".help o .h o .? - Te da ayuda.");
		} else {
			var altCommandHelp;
			var helpCmd;
			var targets = target.split(' ');
			var allCommands = this.bot.id === 'discord' ? Chat.discordCommands : Chat.psCommands;
			if (typeof allCommands[target] === 'string') {
				// If a function changes with command name, help for that command name will be searched first.
				altCommandHelp = target + 'help';
				if (altCommandHelp in allCommands) {
					helpCmd = altCommandHelp;
				} else {
					helpCmd = allCommands[target] + 'help';
				}
			} else if (targets.length > 1 && typeof allCommands[targets[0]] === 'object') {
				// Handle internal namespace commands
				var helpCmd = targets[targets.length - 1] + 'help';
				var namespace = allCommands[targets[0]];
				for (var i = 1; i < targets.length - 1; i++) {
					if (!namespace[targets[i]]) return;
					namespace = namespace[targets[i]];
				}
				if (typeof namespace[helpCmd] === 'object') {
					return this.sendReply(namespace[helpCmd].join('\n'));
				}
			} else {
				helpCmd = target + 'help';
			}
			if (helpCmd in allCommands) {
				if(allCommands[helpCmd] === true) {
					const HelpLang = Features('languages').loadHelp();
					this.sendReply(HelpLang.get(this.lang, target));
				}
                /*if (Array.isArray(allCommands[helpCmd])) {
					this.sendReply(Lang.getSub(this.lang, target, 'msg'));
				}*/
			}
		}
	},
    version: function(target, room, user) {
		return this.sendReply(Lang.replace(this.lang, 'version', Chat.packageData.version));
    },
    say: function(target, user) {
        if(!target) return this.runHelp('say');
		this.sendReply(target);
    },
    sayhelp: true,
	eval: function(target) {
		if(!this.can('hotpatch', true)) return false;
		if(this.bot.id !== 'discord') {
			this.sendReply(`!code ${eval(target)}`);
		} else {
			this.sendReply(eval(target));
		}
	},
	uptime: function() {
		const uptime = process.uptime();
		let uptimeText;
		if (uptime > 24 * 60 * 60) {
		const uptimeDays = Math.floor(uptime / (24 * 60 * 60));
		uptimeText = uptimeDays + " " + (uptimeDays === 1 ? "day" : "days");
		const uptimeHours = Math.floor(uptime / (60 * 60)) - uptimeDays * 24;
		if (uptimeHours) uptimeText += ", " + uptimeHours + " " + (uptimeHours === 1 ? "hour" : "hours");
		} else {
		uptimeText = Tools.toDurationString(uptime * 1000);
		}
		this.sendReply("Uptime: **" + uptimeText + "**");
	},
    pick: function(target) {
        if (!target || !target.includes(',')) {
            return this.runHelp('pick');
        }
        const options = target.split(',');
		const pickedOption = options[Math.floor(Math.random() * options.length)].trim();
		this.sendReply(Lang.replace(this.lang, 'pick', pickedOption));
    },
    pickhelp: true,
};