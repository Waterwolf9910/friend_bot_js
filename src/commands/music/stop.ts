import queue_data = require("./queues")
import voice = require("@discordjs/voice")

let _: import("../../types").Command= {
    // command: async (ctx) => run(ctx.guild.id, ctx.author.id, ctx.channel, queue_data.guild_queues[ ctx.guild.id ]?.vchannel),
    interaction: async (interaction) => run(interaction.guild.id, interaction.user.id, interaction.channel, queue_data.guild_queues[ interaction.guild.id ]?.vchannel),
    slash: require("./slash").addSubcommand(sub => {
        sub.setName("stop")
        sub.setDescription("Stops the player and clears the queue")
        return sub
    }),
    description: "Stops the player and clears the queue",
    usage: "music stop"
}

let run = (guildId: string, authorId: string, text_channel: import('discord.js').TextBasedChannel, voice_channel: import("discord.js").NonThreadGuildBasedChannel): import("../../types").CommandResult => {
    let connection = queue_data.guild_queues[ guildId ]?.connection
    // let player = queue_data.guild_queues[ guildId ]?.player
    if (!queue_data.guild_queues[ guildId ]?.channel_id && connection?.state?.status != voice.VoiceConnectionStatus.Ready) {
        return { flag: 'r', message: "I am not in a vc" }
    }
    
    if (!voice_channel.members.has(authorId)) {
        return { flag: 'r', message: "You are not in the vc" }
    }

    queue_data.end(guildId, true)
    return { flag: 'r', message: "Successfully Stopped" }
}

module.exports = _

export = _
