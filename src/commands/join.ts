import voice = require("@discordjs/voice")
import discord = require("discord.js")
import queues = require("./music/queues")
let _: import("../types").Command= {
    // command: (ctx) => run(ctx.guild.id, ctx.mentions.members.first() || ctx.member),
    interaction: (interaction) => {
        //@ts-ignore
        let member: discord.GuildMember = interaction.member
        return run(interaction.guild.id, member, interaction.channel)
    },
    slash: new discord.SlashCommandBuilder()
        .setName("join")
        .setDescription("Has the bot join the voice channel you are in"),
    description: "Has the bot join the voice channel you are in",
    usage: "join"
}

let run = (guildId: string, member: discord.GuildMember, text_channel: import("discord.js").GuildTextBasedChannel): import('../types').CommandResult => {
    let voice_channel = member.voice.channel
    if (!voice_channel.joinable) {
        return { flag: 'r', message: 'Unable to join this voice channel' }
    }
    if (!queues.guild_queues[guildId] || queues.guild_queues[guildId].connection == null) {
        queues.create(guildId, voice_channel)
        queues.guild_queues[guildId].tchannel = text_channel
        return { flag: 'n' }
    }
    
    queues.guild_queues[guildId].connection.rejoin({ ...queues.guild_queues[guildId].connection.joinConfig, channelId: voice_channel.id })
    queues.guild_queues[guildId].tchannel = text_channel
    // return { flag: 'r', message: 'Error connecting to your channel' }
    return { flag: 'n' }
}

module.exports = _

export = _
