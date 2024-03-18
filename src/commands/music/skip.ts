import queue_data = require("./queues")
import _play = require("./play")

export = {
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
    })
} satisfies import("main/types").Command

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
