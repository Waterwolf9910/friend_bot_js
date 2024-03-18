import queue_data = require("./queues")
import voice = require("@discordjs/voice")

export = {
    interaction: async (interaction) => run(interaction.guild.id, interaction.user.id, queue_data.guild_queues[ interaction.guild.id ]?.vchannel),
    slash: require("./slash").addSubcommand(sub => {
        sub.setName("stop")
        sub.setDescription("Stops the player and clears the queue")
        return sub
    })
} satisfies import("main/types").Command

let run = (guild_id: string, author_id: string, voice_channel: import("discord.js").NonThreadGuildBasedChannel): import("main/types").CommandResult => {
    let connection = queue_data.guild_queues[ guild_id ]?.connection
    // let player = queue_data.guild_queues[ guildId ]?.player
    if (!queue_data.guild_queues[ guild_id ]?.channel_id && connection?.state?.status != voice.VoiceConnectionStatus.Ready) {
        return { flag: 'r', message: "I am not in a vc" }
    }
    
    if (!voice_channel.members.has(author_id)) {
        return { flag: 'r', message: "You are not in the vc" }
    }

    queue_data.end(guild_id, true)
    return { flag: 'r', message: "Successfully Stopped" }
}
