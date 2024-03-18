import queue_data = require("./queues")
import voice = require("@discordjs/voice")
export = {
    slash: require("./slash").addSubcommand((sub) => {
        sub.setDescription("Clears the queue")
        sub.setName("clear")
        return sub
    }),
    interaction: (interaction) => run(interaction.guild.id, interaction.user.id, queue_data.guild_queues[interaction.guild.id].vchannel)
} satisfies import("main/types").Command

let run = async (guild_id: string, author_id: string, voice_channel: import('discord.js').VoiceBasedChannel): Promise<import("main/types").CommandResult> => {
    let connection = queue_data.guild_queues[ guild_id ]?.connection
    // let voice_channel = (await(ctx.guild.channels.fetch(connection.joinConfig.channelId)))
    if (!queue_data.guild_queues[ guild_id ]?.channel_id && connection?.state?.status != voice.VoiceConnectionStatus.Ready) {
        return { flag: 'r', message: "I am not in a vc" }
    }
    if (!voice_channel.members.has(author_id)) {
        return { flag: 'r', message: "You are not in the vc" }
    }
    // queue_data.guild_queues[ctx.guildId].
    // queue_data.guild_queues[ guildId ].queue = []
    // queue_data.guild_queues[ guildId ].next = 0
    queue_data.end(guild_id)
    return { flag: 'r', message: "Queue successfully clear" }
}
