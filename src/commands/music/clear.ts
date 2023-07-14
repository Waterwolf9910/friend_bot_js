import queue_data = require("./queues")
import voice = require("@discordjs/voice")
import discord = require("discord.js")
let _: import("../../types").Command= {
    // command: (ctx) => run(ctx.guild.id, ctx.author.id, queue_data.guild_queues[ctx.guild.id].vchannel),
    slash: require("./slash").addSubcommand((sub) => {
        sub.setDescription("Clears the queue")
        sub.setName("clear")
        return sub
    }),//new discord.SlashCommandSubcommandBuilder().setName("clear").setDescription("Clears the queue"),
    interaction: (interaction) => run(interaction.guild.id, interaction.user.id, queue_data.guild_queues[interaction.guild.id].vchannel),
    description: "Clears the queue",
    usage: "music clear"
}

let run = async (guildId: string, authorId: string, voice_channel: import('discord.js').VoiceBasedChannel): Promise<import("../../types").CommandResult> => {
    let connection = queue_data.guild_queues[ guildId ]?.connection
    // let voice_channel = (await(ctx.guild.channels.fetch(connection.joinConfig.channelId)))
    if (!queue_data.guild_queues[ guildId ]?.channel_id && connection?.state?.status != voice.VoiceConnectionStatus.Ready) {
        return { flag: 'r', message: "I am not in a vc" }
    }
    if (!voice_channel.members.has(authorId)) {
        return { flag: 'r', message: "You are not in the vc" }
    }
    // queue_data.guild_queues[ctx.guildId].
    // queue_data.guild_queues[ guildId ].queue = []
    // queue_data.guild_queues[ guildId ].next = 0
    queue_data.end(guildId)
    return { flag: 'r', message: "Queue successfully clear" }
}

module.exports = _

export = _
