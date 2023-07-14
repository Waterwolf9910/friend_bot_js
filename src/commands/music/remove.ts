import queue_data = require("./queues")
import voice = require("@discordjs/voice")
import discord = require("discord.js")
import slash = require("./slash")
let _: import("../../types").Command = {
    // command: (ctx) => run(ctx.guild.id, ctx.author.id, queue_data.guild_queues[ctx.guild.id].vchannel),
    slash: slash.addSubcommand((sub) => {
        sub.setDescription("Removes an item from the queue")
        sub.setName("remove")
        sub.addIntegerOption(index => {
            index.setRequired(true)
            index.setName("index")
            index.setDescription("The song number")
            return index;
        })
        return sub
    }),//new discord.SlashCommandSubcommandBuilder().setName("clear").setDescription("Clears the queue"),
    interaction: (interaction) => run(interaction.options.getInteger("index"),interaction.guild.id, interaction.user.id, queue_data.guild_queues[ interaction.guild.id ].vchannel),
    description: "Removes an item from the queue",
    usage: "music remove"
}

let run = async (index: number,  guildId: string, authorId: string, voice_channel: import('discord.js').VoiceBasedChannel): Promise<import("../../types").CommandResult> => {
    let connection = queue_data.guild_queues[ guildId ]?.connection
    // let voice_channel = (await(ctx.guild.channels.fetch(connection.joinConfig.channelId)))
    if (!queue_data.guild_queues[ guildId ]?.channel_id && connection?.state?.status != voice.VoiceConnectionStatus.Ready) {
        return { flag: 'r', message: "I am not in a vc" }
    }
    if (!voice_channel.members.has(authorId)) {
        return { flag: 'r', message: "You are not in the vc" }
    }
    if (index < 1) {
        return { flag: 'r', message: "index cannot be less than 1" }
    } else if (index > queue_data.guild_queues[ guildId ].queue.length) {
        return { flag: 'r', message: 'index cannot be greater than the entire queue' }
    }
    // queue_data.guild_queues[ctx.guildId].
    // queue_data.guild_queues[ guildId ].queue = []
    // queue_data.guild_queues[ guildId ].next = 0
    queue_data.guild_queues[ guildId ].queue = queue_data.guild_queues[guildId].queue.filter((_, i) => i != index-1)
    return { flag: 'r', message: "Item successfully removed" }
}

module.exports = _

export = _
