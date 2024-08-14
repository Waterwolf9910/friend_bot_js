import _random = require("wolf_utils/random.js")
import discord = require("discord.js")
let random = _random.createRandom()

export = {
    interaction: (interaction) => run(
        <'rock'> interaction.options.getString("choice")
    ),
    slash: new discord.SlashCommandBuilder()
        .setName("rps")
        .setDescription("Play Rock Paper Scissors with the bot"),
} satisfies import("main/types").Command

let run = (choice: 'rock' | 'paper' | 'scissors'): import("main/types").CommandResult => {
    let bot_choice: 'rock' | 'paper' | 'scissors'
    switch (random.num(2)) {
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
                default: {
                    return {flag: 'n'}
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
                default: {
                    return { flag: 'n' }
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
                default: {
                    return { flag: 'n' }
                }
            }
        }
    }
}
