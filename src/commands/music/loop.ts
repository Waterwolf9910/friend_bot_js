import queue_data = require("./queues")

let _: import("main/types").Command = {
    interaction: (interaction) => {
        let type = interaction.options.getString("loop_type", false)

        return run(interaction.guild.id, <'song'> type)
    },
    slash: require("./slash").addSubcommand(sub => {
        sub.setName("loop")
        sub.setDescription("Toggles the music loop")
        sub.addStringOption(loop_type => {
            loop_type.setName("loop_type")
            loop_type.setDescription("The loop to set to")
            loop_type.setChoices({name: "song", value: "song"}, {name: "queue", value: "queue"}, { name: "off", value: "off" })
            // loop_type.setAutocomplete(true)
            loop_type.setMaxLength(5)
            loop_type.setRequired(false)
            return loop_type
        })
        return sub
    }),
    description: "Toggles the music loop",
    usage: "music loop [queue, song, off]"
}

let run = (guild_id: string, type?: "song" | "queue" | "off"): import("main/types").CommandResult => {
    let cur_loop = queue_data.guild_queues[ guild_id ].loop
    if (type) {
        if (type !== "song" && type !== "queue" && type !== "off") {
            return { flag: 'r', message: "type has to be song, queue, or off" }
        }
        if (type == 'queue') {
            queue_data.guild_queues[ guild_id ].loop = true
        } else if (type == 'song') {
            queue_data.guild_queues[ guild_id ].loop = "song"
        } else {
            queue_data.guild_queues[ guild_id ].loop = false
        }
        return { flag: 's', message: `Looping ${type}` }
    }
    if (cur_loop) {
        queue_data.guild_queues[ guild_id ].loop = "song"
        type = "song"
    } else if (cur_loop == "song") {
        queue_data.guild_queues[ guild_id ].loop = false
        type = "off"
    } else {
        queue_data.guild_queues[ guild_id ].loop = true
        type = "queue"
    }

    return { flag: 's', message: `Looping ${type}` }
}

module.exports = _

export = _
