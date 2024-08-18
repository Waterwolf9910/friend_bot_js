
import queue_data = require("./queues")
export = {
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
    }
} satisfies import("main/types").Command


let run = async (guild_id: string, origin: number, to: number): Promise<import("main/types").CommandResult> => {
    let gqueue_data = queue_data.guild_queues[guild_id]
    if (origin > gqueue_data.queue.length || origin < 1) {
        return { flag: 'r', message: "origin is out of range" }
    }
    if (to > gqueue_data.queue.length || to < 1) {
        return { flag: 'r', message: "to is out of range" }
    }
    let temp = gqueue_data.queue[origin - 1]
    let newqueue = [...gqueue_data.queue.slice(0, origin), ...gqueue_data.queue.slice(origin+1)]
    if (gqueue_data.cur == origin - 1) {
        gqueue_data.cur = to - 1
        gqueue_data.next = to
    }
    newqueue.splice(to - 1, 0, temp)
    queue_data.guild_queues[guild_id].queue = newqueue
}
