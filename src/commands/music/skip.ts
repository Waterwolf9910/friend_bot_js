import voice = require("@discordjs/voice")
import queue_data = require("./queues")
import ytdl = require("ytdl-core")
import dayjs = require("dayjs")

let _: import("../../types").Command= {
    // command: async (ctx, _amount, dir: "forward" | "to" | "back" = "forward") => run(ctx.guild.id,
    //     //@ts-ignore
    //     ctx.channel,
    //     _amount, dir),
    interaction: (interaction) => {
        //@ts-ignore
        let dir: "forward" | "to" | "back" = interaction.options.getString("skip_direction", false)
        return run(interaction.guild.id,
            //@ts-ignore
            interaction.channel,
            interaction.options.getInteger("skip_amount", true), dir)
    },
    slash: require("./slash").addSubcommand(sub => {
        sub.setName("skip")
        sub.setDescription("Skip forward, backword, or to a song in the queue")
        sub.addIntegerOption(skip_amount => {
            skip_amount.setName("skip_amount")
            skip_amount.setDescription("how far to skip")
            skip_amount.setRequired(true)
            return skip_amount
        })
        sub.addStringOption(skip_direction => {
            skip_direction.setName("skip_direction")
            skip_direction.setDescription("Which way to skip")
            skip_direction.setChoices({name: "forward", value: "forward"}, {name: "to", value: "to"}, {name: "back", value: "back"})
            skip_direction.setRequired(false)
            return skip_direction
        })
        return sub
    }),
    description: "Skip forward, backword, or to a song in the queue",
    usage: "music skip [amount] [direction (forward, to, or back)]"
}

let play = async (guildId: string, text_channel: import('discord.js').GuildTextBasedChannel, queue_pos: number) => {
    // console.log("getting ready to play")
    let next = queue_data.guild_queues[guildId].next
    let cur = queue_data.guild_queues[ guildId ]?.cur
    let player = queue_data.guild_queues[ guildId ]?.player
    let queue = queue_data.guild_queues[guildId].queue
    if (player.state.status == voice.AudioPlayerStatus.Playing || player.state.status == voice.AudioPlayerStatus.Buffering || player.state.status == voice.AudioPlayerStatus.Paused) {
        if (!player.stop()) {
            return { flag: 'r', message: 'Issue while skipping to another track' }
        }
    }
    // console.log(queue_pos)
    try {
        // console.log("Playing to skipped")
        player.play(voice.createAudioResource(ytdl(queue[ queue_pos ].link, { liveBuffer: 25000, highWaterMark: 1024 * 1024 * 4, quality: "highestaudio", filter: "audioonly" }), { silencePaddingFrames: 10 }))
    } catch {
        text_channel.send(`There was an error while trying to play this track ([${queue[ queue_pos ].title}](${queue[ queue_pos ].link}))`)
        player.stop()
        if (queue[ queue_pos ]) {
            play(guildId, text_channel, queue_pos)
        } else {
            let timeout_msg = await text_channel.send("No more music in the queue. I will leave in 5 minutes if music is not added.")
            let inv = setTimeout(() => {
                queue_data.end(guildId)
                timeout_msg.edit("I disconnected due to inactivity")
            })
            queue_data.guild_queues[ guildId ].timeout_info = { timeout: inv, msg: timeout_msg, type: "queue" }
        }
        return
    }
    cur = queue_pos
    next = queue_pos + 1
    queue_data.guild_queues[ guildId ].np_msg = {
        color: 3142847,
        title: queue[ cur ].title,
        url: queue[ cur ].link,
        description: `Now Playing #${next}`,
        timestamp: dayjs().toISOString(),
        image: {
            url: queue[ cur ].thumbnail,
        },
        author: {
            name: queue[ cur ].uploader.name,
            url: queue[ cur ].uploader.url
        },
        footer: {
            text: `Looping: Queue ${queue_data.guild_queues[ guildId ].loop === true ? "✅" : "❌"} Song ${queue_data.guild_queues[ guildId ].loop === "song" ? "✅" : "❌"}`
        }
    }
    let np_msg = await text_channel.send({ embeds: [ queue_data.guild_queues[ guildId ].np_msg ] })
    setTimeout(() => {
        try {
            np_msg.delete()
        } catch { }
    }, 5500)
    queue_data.guild_queues[ guildId ].cur = cur
    queue_data.guild_queues[ guildId ].next = next
    queue_data.guild_queues[ guildId ].skiping = false
    // console.log("done skipping")
}

let run = (guildId: string, text_channel: import('discord.js').GuildTextBasedChannel, amount: number, dir: "forward" | "to" | "back" ): import("../../types").CommandResult => {
    queue_data.guild_queues[ guildId ].skiping = true
    /* //@ts-ignore
    if (isNaN(parseInt(_amount))) {
        return { flag: 'r', message: `${_amount} is not a valid number` }
    } */

    /* if (dir !== "forward" && dir !== "to" && dir !== "back") {
        return { flag: 'r', message: "Not a valid direction. Valid directions are forward, to, and back" }
    } */
    if (!dir) {
        dir = 'forward'
    }
    
    let cur = queue_data.guild_queues[ guildId ]?.cur
    let queue = queue_data.guild_queues[ guildId ]?.queue
    if (!queue_data.guild_queues[ guildId ]?.channel_id) {
        return { flag: 'r', message: "I am not in a vc" }
    }

    switch (dir) {
        case "forward": {
            if (queue[ cur + amount ]) {
                play(guildId, text_channel, cur + amount)
            } else if (cur == queue.length - 1) {
                return { flag: 'r', message: "At the end of the queue" }
            } else {
                text_channel.send("Unable to go that far. Going to the end of the queue")
                play(guildId, text_channel, queue.length - 1)
            }
            break
        }
        case "to": {
            queue[ amount - 1 ] ? play(guildId, text_channel, amount - 1) : text_channel.send(`#${amount} not in queue`)
            break;
        }
        case "back": {
            if (queue[ cur - amount ]) {
                play(guildId, text_channel, cur - amount)
            } else if (cur == 0) {
                return { flag: 'r', message: "At the Begining of the queue" }
            } else {
                
                text_channel.send("Unable to go that far. Going to the begining of the queue")
                play(guildId, text_channel, 0)
            }
        }
    }

    return { flag: 'n' }
}

module.exports = _

export = _
