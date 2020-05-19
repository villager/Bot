exports.translations = {
    version: {
        msg: "The Bot's version is $1",
    },
    about: {
        msg: "Hello I'm $1 a multi-plataform created by $2, you can see my code at $3",
    },
    errorlog: {
        link: "Here is your errorlog $1",
        error: "Sorry... we couldn't get the error log"
    },
    say: {
        msg: ".say [target] - Say a sentence"
    },
    pick: {
        msg: '.pick [opc1, opc2, ..] - Randomly selects an item from a list containing 2 or more elements.',
        choose: 'I randomly picked: **$1**',
    },
    tourhelp: {
        msg: '.tour (format), (seconds to start or off), (minutes autodq or off), (max Users or off), (elimination or roundrobin). All arguments are optional.'
    },
    tourend: {
        err: 'There is not a tournament in this room',
        err2: 'Error: Tournament has already started'
    },
    tournament: {
        'e1': 'requires moderator rank (@) or higher to create tornaments',
        e2: 'There is already a tournament in this room',
        invalid_format: 'Format $1 is not valid for tournaments',
        e4: 'Time to start is not a valid time',
        e5: 'Autodq is not a valid time',
        e6: 'Max users number is not valid',
        e7: 'Tour type is not valid. Valid types are: elimination, roundrobin',
        notstarted: 'Error: the tournament did not start, probably because I do not have permission to create tournaments or commands were changed.',
        paramerror: "Parameter $1 not found, valid parameter are: $2",
    },
    official:{
        not: 'Leaderboards are not enabled for room $1',
        notour: 'There is no tournament in this room',
        'already': 'The tournament is already official',
        'already-not': 'The tournament is already unofficial',
        official: 'This tournament is now official and will count for the leaderboards',
        unofficial: 'This tournament is no longer official'
    },
    leaderboard: {
        'usage': 'Usage',
        'invuser': 'Invalid username',
        'rank': 'Ranking of',
        'in': 'in',
        'points': 'Points',
        'w': 'Winner',
        'f': 'Finalist',
        'sf': 'Semifinalist',
        'times': 'times',
        'total': 'Total',
        'tours': 'tours played',
        'bwon': 'battles won',
        'not': 'Leaderboards are not enabled for room $1',
        'empty': 'There are no registered tournaments yet for room',
        'table': 'Leaderboards table',
        'err': 'Error uploading leaderboards table to Hastebin',
        'use': 'Use',
        'confirm': 'to confirm the leaderboars data reset for room',
        'invhash': 'Invalid hashcode',
        'data': 'Leaderboars data for room',
        'del': 'was resetted',
        'wasset': 'Leaderboards configuration was set for room',
        'wasdisabled': 'Leaderboards was disabled for room',
        'alrdisabled': 'Leaderboards is already disabled for room',
        'unknown': 'Unknown option'
    }
};