import queue_data = require("./queues")
import voice = require("@discordjs/voice")

export = {
    slash: require("./slash").addSubcommand(sub => {
        sub.setName("np")
        sub.setDescription("Shows the current song")
        return sub
    }),
    interaction: (interaction) => run(interaction.guild.id)
} satisfies import("main/types").Command

let run = (guild_id: string): import('main/types').CommandResult => {
    let connection = queue_data.guild_queues[ guild_id ]?.connection
    let player = queue_data.guild_queues[ guild_id ]?.player
    if (!queue_data.guild_queues[ guild_id ]?.channel_id && connection?.state?.status != voice.VoiceConnectionStatus.Ready) {
        return { flag: 'r', message: "I am not in a vc" }
    } else if (player?.state?.status !== voice.AudioPlayerStatus.Playing && player?.state?.status !== voice.AudioPlayerStatus.Buffering) {
        if (player?.state?.status == voice.AudioPlayerStatus.Idle || player?.state?.status == voice.AudioPlayerStatus.AutoPaused) {
            return { flag: 'r', message: "I am not playing anything" }
        }
    }
    let np = queue_data.guild_queues[ guild_id ].np_msg

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
                    text: `Looping: Queue ${queue_data.guild_queues[ guild_id ].loop === true ? "✅" : "❌"} Song ${queue_data.guild_queues[ guild_id ].loop == "song" ? "✅" : "❌"}`
                }
            } ]
        } }
}
