import queue_data = require("./queues")
import voice = require("@discordjs/voice")

let run = (guild_id: string, author_id: string, voice_channel: import("discord.js").NonThreadGuildBasedChannel): import('main/types').CommandResult => {
    let connection = queue_data.guild_queues[ guild_id ].connection
    let player = queue_data.guild_queues[ guild_id ].player
    if (!queue_data.guild_queues[ guild_id ].channel_id && connection?.state?.status != voice.VoiceConnectionStatus.Ready) {
        return { flag: 'r', message: "I am not in a vc" }
    } else if (player?.state.status != voice.AudioPlayerStatus.Playing && player?.state?.status != voice.AudioPlayerStatus.Buffering) {
        if (player?.state?.status != voice.AudioPlayerStatus.Paused) {
            return { flag: 'r', message: "I am not paused" }
        }
    }

    if (!voice_channel.members.has(author_id)) {
        return { flag: 'r', message: "You are not in the vc" }
    }
    if (player.unpause()) {
        return { flag: 'r', message: "Successfully Resumed" }
    } else {
        return { flag: 'r', message: "Error Resuming" }
    }
}

let _: import("main/types").Command = {
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
