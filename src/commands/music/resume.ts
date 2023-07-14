import queue_data = require("./queues")
import voice = require("@discordjs/voice")

let run = (guildId: string, authorId: string, voice_channel: import("discord.js").NonThreadGuildBasedChannel): import('../../types').CommandResult => {
    let connection = queue_data.guild_queues[ guildId ].connection
    let player = queue_data.guild_queues[ guildId ].player
    if (!queue_data.guild_queues[ guildId ].channel_id && connection?.state?.status != voice.VoiceConnectionStatus.Ready) {
        return { flag: 'r', message: "I am not in a vc" }
    } else if (player?.state.status != voice.AudioPlayerStatus.Playing && player?.state?.status != voice.AudioPlayerStatus.Buffering) {
        if (player?.state?.status != voice.AudioPlayerStatus.Paused) {
            return { flag: 'r', message: "I am not paused" }
        }
    }

    if (!voice_channel.members.has(authorId)) {
        return { flag: 'r', message: "You are not in the vc" }
    }
    if (player.unpause()) {
        return { flag: 'r', message: "Successfully Resumed" }
    } else {
        return { flag: 'r', message: "Error Resuming" }
    }
}

let _: import("../../types").Command = {
    // command: async (ctx) => run(ctx.guild.id, ctx.author.id, queue_data.guild_queues[ ctx.guild.id ].vchannel),
    interaction: async (interaction) => run(interaction.guild.id, interaction.user.id, queue_data.guild_queues[ interaction.guild.id ].vchannel),
    slash: require("./slash").addSubcommand(sub => {
        sub.setName("resume")
        sub.setDescription("Resumes the paused song")
        return sub
    }),
    description: "Resumes the paused song",
    usage: "music resume or music play",
    // @ts-ignore
    run
}

module.exports = _

export = _
