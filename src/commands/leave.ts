import discord = require('discord.js')
import queues = require("./music/queues")
let _: import("main/types").Command= {
    interaction: (interaction) => run(interaction.guild.id),
    slash: new discord.SlashCommandBuilder()
        .setName("leave")
        .setDescription("Has the bot leave the voice channel"),
    description: "Has the bot leave the voice channel",
    usage: "leave"
}

let run = (guild_id: string): import('main/types').CommandResult => {
    queues.end(guild_id)
    return { flag: 'n' }
}

module.exports = _

export = _
