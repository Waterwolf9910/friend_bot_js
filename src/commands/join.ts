import voice = require("@discordjs/voice")
import discord = require("discord.js")
import queues = require("./music/queues")
let _: import("main/types").Command= {
    interaction: (interaction) => {
        return run(interaction.guild.id, interaction.member, interaction.channel)
    },
    slash: new discord.SlashCommandBuilder()
        .setName("join")
        .setDescription("Has the bot join the voice channel you are in"),
    description: "Has the bot join the voice channel you are in",
    usage: "join"
}

let run = (guild_id: string, member: discord.GuildMember, text_channel: import("discord.js").GuildTextBasedChannel): import('main/types').CommandResult => {
    let voice_channel = member.voice.channel
    if (!voice_channel.joinable) {
        return { flag: 'r', message: 'Unable to join this voice channel' }
    }
    if (!queues.guild_queues[guild_id] || !queues.guild_queues[guild_id]) {
        queues.create(guild_id, voice_channel)
        queues.guild_queues[guild_id].tchannel = text_channel
        return { flag: 'n' }
    }
    
    queues.guild_queues[guild_id].connection.rejoin({ ...queues.guild_queues[guild_id].connection.joinConfig, channelId: voice_channel.id })
    queues.guild_queues[guild_id].tchannel = text_channel
    // return { flag: 'r', message: 'Error connecting to your channel' }
    return { flag: 'n' }
}

module.exports = _

export = _
