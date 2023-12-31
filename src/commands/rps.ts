import _random = require("../libs/random")
import discord = require("discord.js")
let random = new _random(1, 2)
let _: import("../types").Command= {
    interaction: (interaction) => run(
        //@ts-ignore
        interaction.options.getString("choice")
    ),
    slash: new discord.SlashCommandBuilder()
        .setName("slash")
        .setDescription("Play Rock Paper Scissors with the bot"),
    description: "Play Rock Paper Scissors with a the bot",
    usage: "rps"
}

let run = (choice: 'rock' | 'paper' | 'scissors'): import("../types").CommandResult => {
    let bot_choice: 'rock' | 'paper' | 'scissors'
    switch (random.num()) {
        case 0: {
            bot_choice = 'rock'
            break;
        }
        case 1: {
            bot_choice = 'paper'
            break;
        }
        case 2: {
            bot_choice = "scissors"
            break;
        }
    }

    switch (choice) {
        case "paper": {
            switch (bot_choice) {
                case "paper": {
                    return {flag: 'r', message: 'Draw'}
                }
                case "scissors": {
                    return {flag: 'r', message: 'Lose'}
                }
                case "rock": {
                    return {flag: 'r', message: 'Win'}
                }
            }
        }
        case "rock": {
            switch (bot_choice) {
                case "paper": {
                    return { flag: 'r', message: 'Lose' }
                }
                case "scissors": {
                    return { flag: 'r', message: 'Win' }
                }
                case "rock": {
                    return { flag: 'r', message: 'Draw' }
                }
            }
        }
        case "scissors": {
            switch (bot_choice) {
                case "paper": {
                    return { flag: 'r', message: 'Win' }
                }
                case "scissors": {
                    return { flag: 'r', message: 'Draw' }
                }
                case "rock": {
                    return { flag: 'r', message: 'Lose' }
                }
            }
        }
    }
}
