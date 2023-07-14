import queue_data = require("./queues")
import voice = require("@discordjs/voice")

let _: import("../../types").Command= {
    // command: async (ctx) => await run(ctx.guild.id, ctx.author.id, queue_data.guild_queues[ ctx.guild.id ]?.vchannel),
    interaction: async (interaction) => {
        return run(interaction.guild.id, interaction.user.id, queue_data.guild_queues[ interaction.guild.id ]?.vchannel)
    },
    slash: require("./slash").addSubcommand(sub => {
        sub.setName("pause")
        sub.setDescription("Pauses the current song")
        return sub
    }),
    description: "Pauses the current song",
    usage: "music pause"
}

let run = async (guildId: string, authorId: string, voice_channel: import('discord.js').NonThreadGuildBasedChannel): Promise<import('../../types').CommandResult> => {
    let connection = queue_data.guild_queues[ guildId ]?.connection
    let player = queue_data.guild_queues[ guildId ]?.player
    if (!queue_data.guild_queues[ guildId ]?.channel_id && connection?.state?.status != voice.VoiceConnectionStatus.Ready) {
        return { flag: 'r', message: "I am not in a vc" }
    } else if (player?.state?.status !== voice.AudioPlayerStatus.Playing && player?.state?.status !== voice.AudioPlayerStatus.Buffering) {
        if (player?.state?.status == voice.AudioPlayerStatus.Paused) {
            return { flag: 'r', message: "I am already paused" }
        } else if (player?.state?.status == voice.AudioPlayerStatus.Idle || player?.state?.status == voice.AudioPlayerStatus.AutoPaused) {
            return { flag: 'r', message: "I am not playing anything" }
        }
    }
    
    if (!voice_channel.members.has(authorId)) {
        return { flag: 'r', message: "You are not in the vc" }
    }
    if (!player.pause()) {
        return { flag: 'r', message: "Error pausing" }
    }
    return { flag: 'n' }
}

module.exports = _

export = _
