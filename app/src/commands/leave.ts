import discord = require('discord.js')
import queues = require("./music/queues")
export = {
    interaction: (interaction) => run(interaction.guild.id),
    slash: new discord.SlashCommandBuilder()
        .setName("leave")
        .setDescription("Has the bot leave the voice channel")
} satisfies import("main/types").Command

let run = (guild_id: string): import('main/types').CommandResult => {
    queues.end(guild_id, true)
    return { flag: 'n' }
}
