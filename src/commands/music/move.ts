
import queue_data = require("./queues")
let _: import("../../types").Command = {
    slash: require("./slash").addSubcommand(sub => {
        sub.setName("move")
        sub.setDescription("Move a song to a different position")
        sub.addIntegerOption(origin => {
            origin.setName("origin")
            origin.setDescription("The song to move")
            origin.setRequired(true)
            return origin
        })
        sub.addIntegerOption(to => {
            to.setName("to")
            to.setDescription("Where to move the song")
            to.setRequired(true)
            return to;
        })
        return sub
    }),
    interaction: interaction => {
        return run(interaction.guildId, interaction.options.getInteger("origin"), interaction.options.getInteger("to"))
    },
    description: "Moves the song to a different position",
    usage: "/music move 5 1"
}


let run = async (guildId: string, origin: number, to: number): Promise<import("../../types").CommandResult> => {
    let queueData = queue_data.guild_queues[guildId]
    if (origin > queueData.queue.length || origin < 1) {
        return { flag: 'r', message: "origin is out of range" }
    }
    if (to > queueData.queue.length || to < 1) {
        return { flag: 'r', message: "to is out of range" }
    }
    let temp = queueData.queue[origin - 1]
    let newqueue = [...queueData.queue.slice(0, origin), ...queueData.queue.slice(origin+1)]
    if (queueData.cur == origin - 1) {
        queueData.cur = to - 1
        queueData.next = to
    }
    newqueue.splice(to - 1, 0, temp)
    queue_data.guild_queues[guildId].queue = newqueue
}

export = _
