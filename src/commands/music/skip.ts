import queue_data = require("./queues")
import _play = require("./play")

let _: import("main/types").Command= {
    interaction: (interaction) => {
        let dir: "forward" | "to" | "back" = <'forward'> interaction.options.getString("skip_direction", false)
        return run(interaction.guild.id,
            interaction.channel,
            interaction.options.getInteger("skip_amount", true), dir)
    },
    slash: require("./slash").addSubcommand(sub => {
        sub.setName("skip")
        sub.setDescription("Skip forward, backword, or to a song in the queue")
        sub.addIntegerOption(skip_amount => {
            skip_amount.setName("skip_amount")
            skip_amount.setDescription("how far to skip")
            skip_amount.setRequired(false)
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

// let play = async (guild_id: string, text_channel: import('discord.js').GuildTextBasedChannel, queue_pos: number) => {
//     // console.log("getting ready to play")
//     let next: number
//     let cur: number
//     let player = queue_data.guild_queues[ guild_id ]?.player
//     let queue = queue_data.guild_queues[guild_id].queue
//     if (player.state.status == voice.AudioPlayerStatus.Playing || player.state.status == voice.AudioPlayerStatus.Buffering || player.state.status == voice.AudioPlayerStatus.Paused) {
//         if (!player.stop()) {
//             return { flag: 'r', message: 'Issue while skipping to another track' }
//         }
//     }
//     // console.log(queue_pos)
//     try {
//         // console.log("Playing to skipped")
//         player.play(voice.createAudioResource(ytdl(queue[ queue_pos ].link, { liveBuffer: 25000, highWaterMark: 1024 * 1024 * 4, quality: "highestaudio", filter: "audioonly" }), { silencePaddingFrames: 10 }))
//     } catch {
//         text_channel.send(`There was an error while trying to play this track ([${queue[ queue_pos ].title}](${queue[ queue_pos ].link}))`)
//         player.stop()
//         if (queue[ queue_pos ]) {
//             play(guild_id, text_channel, queue_pos)
//         } else {
//             let timeout_msg = await text_channel.send("No more music in the queue. I will leave in 5 minutes if music is not added.")
//             let inv = setTimeout(() => {
//                 queue_data.end(guild_id)
//                 timeout_msg.edit("I disconnected due to inactivity")
//             })
//             queue_data.guild_queues[ guild_id ].timeout_info = { timeout: inv, msg: timeout_msg, type: "queue" }
//         }
//         return
//     }
//     cur = queue_pos
//     next = queue_pos + 1
//     queue_data.guild_queues[ guild_id ].np_msg = {
//         color: 3142847,
//         title: queue[ cur ].title,
//         url: queue[ cur ].link,
//         description: `Now Playing #${next}`,
//         timestamp: dayjs().toISOString(),
//         image: {
//             url: queue[ cur ].thumbnail,
//         },
//         author: {
//             name: queue[ cur ].uploader.name,
//             url: queue[ cur ].uploader.url
//         },
//         footer: {
//             text: `Looping: Queue ${queue_data.guild_queues[ guild_id ].loop === true ? "✅" : "❌"} Song ${queue_data.guild_queues[ guild_id ].loop === "song" ? "✅" : "❌"}`
//         }
//     }
//     let np_msg = await text_channel.send({ embeds: [ queue_data.guild_queues[ guild_id ].np_msg ] })
//     setTimeout(() => {
//         try {
//             np_msg.delete()
//         } catch { }
//     }, 5500)
//     queue_data.guild_queues[ guild_id ].cur = cur
//     queue_data.guild_queues[ guild_id ].next = next
//     queue_data.guild_queues[ guild_id ].skipping = false
//     // console.log("done skipping")
// }

let run = (guild_id: string, text_channel: import('discord.js').GuildTextBasedChannel, amount: number, dir: "forward" | "to" | "back" ): import("main/types").CommandResult => {
    queue_data.guild_queues[ guild_id ].skipping = true

    dir ??= 'forward'
    amount ||= 1
    
    let cur = queue_data.guild_queues[ guild_id ].cur
    let queue = queue_data.guild_queues[ guild_id ].queue
    if (!queue_data.guild_queues[ guild_id ].channel_id) {
        return { flag: 'r', message: "I am not in a vc" }
    }

    switch (dir) {
        case "forward": {
            if (queue[ cur + amount ]) {
                queue_data.guild_queues[guild_id].next = cur + amount
            } else if (cur == queue.length - 1) {
                return { flag: 'r', message: "At the end of the queue" }
            } else {
                text_channel.send("Unable to go that far. Going to the end of the queue")
                queue_data.guild_queues[guild_id].next = queue.length - 1
            }
            break
        }
        case "to": {
            if (queue[ amount - 1 ]) {
                queue_data.guild_queues[guild_id].next = amount - 1
            } else {
                return { flag: 's', message: `#${amount} not in queue` }
            }
            break;
        }
        case "back": {
            if (queue[ cur - amount ]) {
                queue_data.guild_queues[guild_id].next = cur - amount
            } else if (cur == 0) {
                return { flag: 's', message: "At the Begining of the queue" }
            } else {
                text_channel.send("Unable to go that far. Going to the begining of the queue")
                queue_data.guild_queues[guild_id].next = 0
            }
        }
    }

    _play.play_next(text_channel, guild_id)

    return { flag: 'n' }
}

module.exports = _

export = _
