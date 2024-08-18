import discord = require('discord.js')
import node_canvas = require('canvas')

type gameData = {
    board: {player: -1 | 0 | 1, icon: string}[]
    turn: 0 | 1,
    id: string,
    msg: discord.Message<true>
    reponse_msg?: discord.Message<true>
}

type playerData = {
    p0: {
        icon: string,
        id: string
    },
    p1: {
        icon: string,
        id: string
    }
}

let send_msg = (image: Buffer, id: string, msg: discord.Message<true>) => {
    let embed: discord.APIEmbed = {
        title: "Tic Tac Toe",
        image: {
            url: "attachment://board.png"
        },
        footer: {
            text: `game_id: ${id}`
        }
    }
    return msg.edit({
        embeds: [embed],
        files: [new discord.AttachmentBuilder(image).setName("board.png")]
    })
}

export = {
    interaction: (interaction) => run(
        interaction.member,
        interaction.options.getMember("player2"),
    interaction.channel),
    slash: new discord.SlashCommandBuilder()
        .setName("tic")
        .setDescription("Starts a tic-tac-toe game")
        .addUserOption(player2 => {
            player2.setName("player2")
            player2.setDescription("Starts a tic tac toe game")
            return player2
        })
} satisfies import("main/types").Command

let checkPlayerStatus = (game: gameData, player: number) => {
    let won = false
    if (game.board[0].player == player && game.board[1].player == player && game.board[2].player == player) {
        won = true
    }
    if (game.board[3].player == player && game.board[4].player == player && game.board[5].player == player) {
        won = true
    }
    if (game.board[6].player == player && game.board[7].player == player && game.board[8].player == player) {
        won = true
    }
    if (game.board[0].player == player && game.board[3].player == player && game.board[6].player == player) {
        won = true
    }
    if (game.board[4].player == player && game.board[1].player == player && game.board[7].player == player) {
        won = true
    }
    if (game.board[6].player == player && game.board[8].player == player && game.board[2].player == player) {
        won = true
    }
    if (game.board[0].player == player && game.board[4].player == player && game.board[8].player == player) {
        won = true
    }
    if (game.board[6].player == player && game.board[4].player == player && game.board[2].player == player) {
        won = true
    }
    return won
}

let render = (game: gameData, players: playerData) => {
    let size = 256
    let canvas = node_canvas.createCanvas(size, size)
    let ctx = canvas.getContext('2d', {alpha: true})
    let center_text_map = [1, 3, 5]
    ctx.fillStyle = ctx.strokeStyle = 'rgba(128, 128, 128, 1)'
    ctx.font = (size * 2 / 9) + 'px monospace'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    let border_size = size / 3
    let i = 0
    for (let y = 0; y < 3; ++y) {
        for (let x = 0; x < 3; ++x) {
            ctx.strokeRect(border_size * x, border_size * y, border_size, border_size)
            ctx.fillText(game.board[i++].icon, size / 6 * center_text_map[x], size / 6 * center_text_map[y] + 5)
        }
    }
    let board = canvas.toBuffer("image/png")
    if (checkPlayerStatus(game, 0)) {
        return { board, data: `<@!${players.p0.id}> won the game`, continue: false}
    } else if (checkPlayerStatus(game, 1)) {
        return { board, data: `<@!${players.p1.id}> won the game`, continue: false }
    } else {
        return { board, data: `<@!${players[`p${game.turn}`].id}>'s turn`, continue: true }
    }
}

let runGame = async (game: gameData, players: playerData) => {
    let raw_pick: discord.Message<boolean>
    try {
        raw_pick = (await game.msg.channel.awaitMessages({ max: 1, time: 120000 })).first()
    } catch {
        game.msg.channel.send(`<@!${players[`p${game.turn}`].id}> took too long, <@!${players[`p${(game.turn + 1) % 2}`].id}> wins!`)
        return
    }

    if (raw_pick == null) {
        return;
    }

    let split = raw_pick.content.split(' ')

    if (split[ 0 ] == 'stop_game' && split[ 1 ] == game.id) {
        game.reponse_msg?.delete()
        if (raw_pick.member.permissions.has("ManageChannels")) {
            game.reponse_msg = await game.msg.channel.send("Stopping Game")
        } else {
            game.reponse_msg = await game.msg.channel.send(raw_pick.author.id == players.p0.id || raw_pick.author.id == players.p1.id ? "Send 'stop' to end the game" : "You do not have the permission to stop this game")
            runGame(game, players)
        }
        return;
    }

    if (raw_pick.author.id !== players.p0.id && raw_pick.author.id !== players.p1.id) {
        return runGame(game, players)
    }

    if (raw_pick.content == "stop") {
        game.reponse_msg.delete()
        return game.msg.channel.send("Done")
    }

    if (raw_pick.author.id != players[`p${game.turn}`].id) {
        game.reponse_msg = await game.msg.channel.send("It is not your turn")
        return runGame(game, players)
    }

    let pick = parseInt(raw_pick.content)

    if (isNaN(pick)) {
        // game.msg.channel.send("Not a number")
        return runGame(game, players);
    }

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
    game.reponse_msg.delete()
    if (pick > 9 || pick < 1) {
        game.reponse_msg = await game.msg.channel.send("tile has to be 1-9")
        return runGame(game, players)
    }
    if (game.board[pick - 1].player != -1) {
        game.reponse_msg = await game.msg.channel.send("This tile is already taken")
        return runGame(game, players)
    }
    game.board[pick - 1].player = game.turn
    game.board[pick - 1].icon = players[ `p${game.turn}` ].icon
    game.turn = (1+game.turn) % 2 as 0 | 1
    let rdata = render(game, players)
    game.msg = await send_msg(rdata.board, game.id, game.msg)
    game.reponse_msg = await game.msg.channel.send(rdata.data)
    if (rdata.continue) {
        runGame(game, players)
    }
}

let start = async (id1: string, id2: string, channel: discord.GuildTextBasedChannel) => {
    // let icon_map = ["1", "2", "3", "4", "5", "6", "7", "8", "9"]
    let icon_map = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣"]
    let msg = await channel.send("Starting Game")
    let players: playerData = {
        p0: { icon: "❌", id: id1 },
        p1: { icon: "⭕", id: id2 },
        // p0: { icon: "X", id: id1 },
        // p1: { icon: "O", id: id2 }
    }
    let game: gameData = {
        board: Array(9).fill(undefined).map((v, i) => ({ icon: icon_map[i], player: -1})),
        turn: Math.round(Math.random()) as 0 | 1,
        id: msg.id,
        msg
    }

    return {players, game}
}

let run = async (player1: discord.GuildMember, player2: discord.GuildMember, channel: discord.GuildTextBasedChannel): Promise<import('main/types').CommandResult> => {
    if (!player2) {
        channel.send(`${player1} wants to play a game of Tic Tac Toe. Send 'join' to play with them.`)
        channel.awaitMessages({time: 90000, max: 1, errors: ["time"], filter: (msg) => {return msg.author.id !== player1.id && msg.content == "join"}})
            .then(async msg_col => {
                let _ = await start(player1.id, msg_col.first().author.id, channel)
                let r = render(_.game, _.players)
                _.game.msg = await send_msg(r.board, _.game.id, _.game.msg)
                _.game.reponse_msg = await channel.send(r.data);
                runGame(_.game, _.players)
            })
            .catch(() => {
                channel.send("Not enough players, canceling this game")
            })
    }
    if (player2.id == player1.id) {
        return { flag: 'r', message: 'You cannot play against yourself' }
    }

    channel.send(`${player2}, ${player1} wants to play a game of Tic Tac Toe with you. Send 'join' to play with them.`)
    channel.awaitMessages({ time: 90000, max: 1, errors: ["time"], filter: (msg) => { return msg.author.id == player2.id && msg.content == "join" } })
        .then(async () => {
            let _ = await start(player1.id, player2.id, channel)
            let r = render(_.game, _.players)
            _.game.msg = await send_msg(r.board, _.game.id, _.game.msg)
            _.game.reponse_msg = await channel.send(r.data);
            runGame(_.game, _.players)
        })
        .catch(() => {
            channel.send("Not enough players, canceling this game")
        })

    // let _ = await start(player1.id, player2.id, channel)
    // render(_.game, _.players)

    return { flag: 'n' }
}
