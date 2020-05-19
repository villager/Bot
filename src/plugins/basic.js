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
			var allCommands = Chat.discordCommands;
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
                if (Array.isArray(allCommands[helpCmd])) {
					this.sendReply(allCommands[helpCmd].join('\n'));
				}
			}
		}
	},
    version: function(target, room, user) {
		return this.replyTrad('msg', Chat.packageData.version);
    },
    say: function(target, user) {
        if(!target) return this.runHelp('say');
		this.sendReply(target);
    },
    sayhelp: [Features.get('languages').get(Config.language, 'say')['msg']],

    pick: function(target) {
        if (!target || !target.includes(',')) {
            return this.runHelp('pick');
        }
        const options = target.split(',');
        const pickedOption = options[Math.floor(Math.random() * options.length)].trim();
		this.replyTrad('choose', pickedOption);
    },
    pickhelp: [Features.get('languages').get(Config.language, 'pick')['msg']],
};