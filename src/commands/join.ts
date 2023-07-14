import voice = require("@discordjs/voice")
import discord = require("discord.js")
let _: import("../types").Command= {
    // command: (ctx) => run(ctx.guild.id, ctx.mentions.members.first() || ctx.member),
    interaction: (interaction) => {
        //@ts-ignore
        let member: discord.GuildMember = interaction.member
        return run(interaction.guild.id, member)
    },
    slash: new discord.SlashCommandBuilder()
        .setName("join")
        .setDescription("Has the bot join the voice channel you are in"),
    description: "Has the bot join the voice channel you are in",
    usage: "join"
}

let run = (guildId: string, member: discord.GuildMember): import('../types').CommandResult => {
    let voice_channel = member.voice.channel
    let connection = voice.getVoiceConnection(guildId)
    if (!voice_channel.joinable) {
        return { flag: 'r', message: 'Unable to join this voice channel' }
    }
    if (connection == null) {
        connection = voice.joinVoiceChannel({
            channelId: voice_channel.id,
            guildId: voice_channel.guild.id,
            adapterCreator: voice_channel.guild.voiceAdapterCreator,
            selfDeaf: true,
            selfMute: false
        })
        return { flag: 'n' }
    }
    if (!connection?.rejoin({ ...connection.joinConfig, channelId: voice_channel.id })) {
        return { flag: 'r', message: 'Error connecting to your channel' }
    }
    return { flag: 'n' }
}

module.exports = _

export = _
