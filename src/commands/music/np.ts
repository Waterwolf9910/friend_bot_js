import queue_data = require("./queues")
import voice = require("@discordjs/voice")

let _: import("../../types").Command= {
    // command: (ctx) => run(ctx.guildId),
    slash: require("./slash").addSubcommand(sub => {
        sub.setName("np")
        sub.setDescription("Shows the current song")
        return sub
    }),
    interaction: (interaction) => run(interaction.guild.id),
    description: "Shows the current song",
    usage: "music np"
}

let run = (guildId: string): import('../../types').CommandResult => {
    let returner = "Base"
    let connection = queue_data.guild_queues[ guildId ]?.connection
    let player = queue_data.guild_queues[ guildId ]?.player
    if (!queue_data.guild_queues[ guildId ]?.channel_id && connection?.state?.status != voice.VoiceConnectionStatus.Ready) {
        return { flag: 'r', message: "I am not in a vc" }
    } else if (player?.state?.status !== voice.AudioPlayerStatus.Playing && player?.state?.status !== voice.AudioPlayerStatus.Buffering) {
        if (player?.state?.status == voice.AudioPlayerStatus.Idle || player?.state?.status == voice.AudioPlayerStatus.AutoPaused) {
            return { flag: 'r', message: "I am not playing anything" }
        }
    }
    let np = queue_data.guild_queues[ guildId ].np_msg

    return {
        flag: 'r',
        message: {
            embeds: [ {
                color: np.color,
                title: np.title,
                url: np.url,
                description: np.description,
                timestamp: np.timestamp,
                image: np.image,
                author: np.author,
                footer: {
                    text: `Looping: Queue ${queue_data.guild_queues[ guildId ].loop === true ? "✅" : "❌"} Song ${queue_data.guild_queues[ guildId ].loop == "song" ? "✅" : "❌"}`
                }
            } ]
        } }
}

module.exports = _

export = _
