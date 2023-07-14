import discord = require('discord.js')
type gameData = {
    t1: {
        player: number,
        icon: string
    },
    t2: {
        player: number,
        icon: string
    },
    t3: {
        player: number,
        icon: string
    },
    t4: {
        player: number,
        icon: string
    },
    t5: {
        player: number,
        icon: string
    },
    t6: {
        player: number,
        icon: string
    },
    t7: {
        player: number,
        icon: string
    },
    t8: {
        player: number,
        icon: string
    },
    t9: {
        player: number,
        icon: string
    },
    turn: number,
    id: string
}
type playerData = {
    p1: {
        icon: string,
        id: string
    },
    p2: {
        icon: string,
        id: string
    }
}
/* let _: import("../types").Command= {
    // command: (ctx) => {
    //     let game: gameData = {
    //         id: 'dev-id',
    //         t1: { player: 0, icon: "1️⃣" },
    //         t2: { player: 0, icon: "2️⃣" },
    //         t3: { player: 0, icon: "3️⃣" },
    //         t4: { player: 0, icon: "4️⃣" },
    //         t5: { player: 0, icon: "5️⃣" },
    //         t6: { player: 0, icon: "6️⃣" },
    //         t7: { player: 0, icon: "7️⃣" },
    //         t8: { player: 0, icon: "8️⃣" },
    //         t9: { player: 0, icon: "9️⃣" },
    //         turn: 1
    //     }
    //     let players: playerData = {
    //         p1: { icon: "❌", id: 'dev-id' },
    //         p2: { icon: "⭕", id: 'dev-id' }
    //     }
    //     return { flag: 's', message: render(game, players).board }        
    // },
    usage: 'tick-tack-toe',
    description: 'starts a game of tick tack toe',
    level: 'user',
    interaction: (interaction) => {
        let game: gameData = {
            id: 'dev-id',
            t1: { player: 0, icon: "1️⃣" },
            t2: { player: 0, icon: "2️⃣" },
            t3: { player: 0, icon: "3️⃣" },
            t4: { player: 0, icon: "4️⃣" },
            t5: { player: 0, icon: "5️⃣" },
            t6: { player: 0, icon: "6️⃣" },
            t7: { player: 0, icon: "7️⃣" },
            t8: { player: 0, icon: "8️⃣" },
            t9: { player: 0, icon: "9️⃣" },
            turn: 1
        }
        let players: playerData = {
            p1: { icon: "❌", id: 'dev-id' },
            p2: { icon: "⭕", id: 'dev-id' }
        }
        return { flag: 's', message: render(game, players).board }
    },
    slash: new discord.SlashCommandBuilder()
        .setName("tick")
        .setDescription("Starts a game of tick tack toe")
} */
let _: import("../types").Command= {
    // command: async (ctx) => {
    // },
    interaction: (interaction) => run(
        //@ts-ignore
        interaction.member,
        //@ts-ignore
        interaction.options.getMember("player2"),
    interaction.channel),
    //@ts-ignore
    slash: new discord.SlashCommandBuilder()
        .setName("tick")
        .setDescription("Starts a tick-tack-toe game")
        .addUserOption(player2 => {
            player2.setName("player2")
            player2.setDescription("Starts a tick tack toe game")
            return player2
        }),
    description: "Starts a tick tack toe game",
    usage: "tick-tack-toe [mention] or tick [mention] or roshambo [mention]"
}

let checkPlayerStatus = (game: gameData, player: number) => {
    let won = false
    if (game.t1.player == player && game.t2.player == player && game.t3.player == player) {
        won = true
    }
    if (game.t4.player == player && game.t5.player == player && game.t6.player == player) {
        won = true
    }
    if (game.t7.player == player && game.t8.player == player && game.t9.player == player) {
        won = true
    }
    if (game.t1.player == player && game.t4.player == player && game.t7.player == player) {
        won = true
    }
    if (game.t5.player == player && game.t2.player == player && game.t8.player == player) {
        won = true
    }
    if (game.t6.player == player && game.t9.player == player && game.t3.player == player) {
        won = true
    }
    if (game.t1.player == player && game.t5.player == player && game.t9.player == player) {
        won = true
    }
    if (game.t7.player == player && game.t5.player == player && game.t3.player == player) {
        won = true
    }
    return won
}

let render = (game: gameData, players: playerData) => {
    let board =  `
┌──┬──┬──┐
├${game.t1.icon}┼${game.t2.icon}┼${game.t3.icon}┤
├──┼──┼──┤
├${game.t4.icon}┼${game.t5.icon}┼${game.t6.icon}┤
├──┼──┼──┤
├${game.t7.icon}┼${game.t8.icon}┼${game.t9.icon}┤
└──┴──┴──┘
    game id: ${game.id}`
    // let p1Tiles = getPlayerTiles(1)
    // let p2Tiles = getPlayerTiles(2)
    if (checkPlayerStatus(game, 1)) {
        return { board, data: `<@!${players.p1.id}> won the game`, continue: false}
    } else if (checkPlayerStatus(game, 2)) {
        return { board, data: `<@!${players.p2.id}> won the game`, continue: false }
    } else {
        return { board, data: `<@!${players[`p${game.turn}`].id}>'s turn`, continue: true }
    }
}

let runGame = async (ctx: import("discord.js").Message<true>, game: gameData, players: playerData) => {
    let raw_pick = (await ctx.channel.awaitMessages({ max: 1 })).first()
    
    console.log("'" + raw_pick.content + "'", raw_pick.content.split(' ')[ 1 ], raw_pick, game.id)

    if (raw_pick.content.split(' ')[ 0 ] == 'stop_game' && raw_pick.content.split(' ')[ 1 ] == game.id) {
        console.log("Run 2")
        if (raw_pick.member.permissions.has("ManageChannels")) {
            ctx.channel.send("Stopping Game")
        } else {
            ctx.channel.send(raw_pick.author.id == players.p1.id || raw_pick.author.id == players.p2.id ? "Send 'stop' to end the game" : "You do not have the permission to stop this game")
            runGame(ctx, game, players)
        }
        return;
    }

    if (raw_pick.author.id !== players.p1.id && raw_pick.author.id !== players.p2.id) {
        console.log("Run 4", raw_pick.author.id, players.p1.id, players.p2.id, raw_pick.author.id == players.p1.id, raw_pick.author.id == players.p2.id)
        return runGame(ctx, game, players)
    }

    if (raw_pick.content == "stop") {
        return ctx.channel.send("Done")
    }

    if (raw_pick.content.split(' ')[0] == "pick") {
        return runGame(ctx, game, players);
    }

    let pick = parseInt(raw_pick.content)
    /* if (raw_pick.author.id !== players[ `p${game.turn}` ].id) {
        if (!isNaN(pick)) {
            ctx.channel.send(`Its <@!${players[ `p${game.turn}` ].id}>'s turn`)
        }
        runGame(ctx, game, players)
        return
    }
    if (isNaN(pick)) {
        ctx.channel.send(`${raw_pick.content} is not a number`)
        runGame(ctx, game, players)
        return
    } */
    if (pick > 9 || pick < 1) {
        ctx.channel.send("tile has to be 1-9")
        runGame(ctx, game, players)
        return
    }
    if (game[ `t${pick}` ].player == 0) {
        game[ `t${pick}` ].player = game.turn
        game[ `t${pick}` ].icon = players[ `p${game.turn}` ].icon
        game.turn = game.turn == 1 ? game.turn = 2 : game.turn = 1
        let rdata = render(game, players)
    } else {
        ctx.channel.send("This tile is already taken")
        runGame(ctx, game, players)
    }
}

let start = async (id1: string, id2: string, channel: discord.GuildTextBasedChannel) => {
    let players: playerData = {
        p1: { icon: "❌", id: id1 },
        p2: { icon: "⭕", id: id2 }
    }
    let game: gameData = {
        t1: { player: 0, icon: "1️⃣" },
        t2: { player: 0, icon: "2️⃣" },
        t3: { player: 0, icon: "3️⃣" },
        t4: { player: 0, icon: "4️⃣" },
        t5: { player: 0, icon: "5️⃣" },
        t6: { player: 0, icon: "6️⃣" },
        t7: { player: 0, icon: "7️⃣" },
        t8: { player: 0, icon: "8️⃣" },
        t9: { player: 0, icon: "9️⃣" },
        turn: 1,
        id: (await channel.send("Starting Game")).id
    }

    return {players, game}
}

let run = async (player1: discord.GuildMember, player2: discord.GuildMember, channel: discord.GuildTextBasedChannel): Promise<import('../types').CommandResult> => {
    if (!player2) {
        channel.send(`<@!${player1.id}> wants to play a game of Tick Tack Toe. Send 'join' to play with them.`)
        channel.awaitMessages({time: 90000, max: 1, errors: ["time"], filter: (msg) => {return msg.author.id !== player1.id && msg.content == "join"}})
            .then(async msg_col => {
                let _ = await start(player1.id, player2.id, channel)
                render(_.game, _.players)
            })
            .catch(() => {
                channel.send("Not enough players, canceling this game")
            })
    }
    if (player2.id == player1.id) {
        return { flag: 'r', message: 'You cannot play against yourself' }
    }

    let _ = await start(player1.id, player2.id, channel)

    // let getPlayerTiles = (player: number) => {
    //     let tiles = {t1: false, t2: false, t3: false, t4: false, t5: false, t6: false, t7: false, t8: false, t9: false}
    //     if (game.t1.player == player) {
    //         tiles.t1 = true
    //     }
    //     if (game.t2.player == player) {
    //         tiles.t2 = true
    //     }
    //     if (game.t3.player == player) {
    //         tiles.t3 = true
    //     }
    //     if (game.t4.player == player) {
    //         tiles.t4 = true
    //     } 
    //     if (game.t5.player == player) {
    //         tiles.t5 = true
    //     }
    //     if (game.t6.player == player) {
    //         tiles.t6 = true
    //     }
    //     if (game.t7.player == player) {
    //         tiles.t7 = true
    //     }
    //     if (game.t8.player == player) {
    //         tiles.t8 = true
    //     }
    //     if (game.t9.player == player) {
    //         tiles.t9 = true
    //     }
    //     return tiles
    // }
    
    render(_.game, _.players)

    return { flag: 'n' }
}

module.exports = _

export = _
