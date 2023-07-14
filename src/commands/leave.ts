import voice = require("@discordjs/voice")
import discord = require('discord.js')
let _: import("../types").Command= {
    interaction: (interaction) => run(interaction.guild.id),
    slash: new discord.SlashCommandBuilder()
        .setName("leave")
        .setDescription("Has the bot leave the voice channel"),
    description: "Has the bot leave the voice channel",
    usage: "leave"
}

let run = (guildId: string): import('../types').CommandResult => {
    voice.getVoiceConnection(guildId)?.destroy()
    return { flag: 'n' }
}

module.exports = _

export = _
