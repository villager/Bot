'use strict';

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
    version: function(target, user) {
        return this.sendReply(`La version del Bot es ${Chat.packageData.version}`);
    },
    say: function(target, user) {
        if(!target) return this.runHelp('say');
        this.sendReply(target);
    },
    sayhelp: ['.say [target] - Decir una oracion'],

    about: function() {
        let packageData = Chat.packageData;
        this.linkifyReply('Acerca de mi...',
        `Soy ${Config.name} un bot multi-plataforma creado 
        por ${packageData.author && packageData.author.name} para el servidor Space Showdown
        `, packageData.url);
    },

    pick: function(target) {
        if (!target || !target.includes(',')) {
            return this.runHelp('pick');
        }
        const options = target.split(',');
        const pickedOption = options[Math.floor(Math.random() * options.length)].trim();
        this.sendReply(`Opcion elegida: **${pickedOption}**`);
    },
    pickhelp: ['.pick [opc1, opc2, ..] - Elige una opcion entre las opciones'],
    
};