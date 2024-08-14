import queue_data = require("./queues")
import utils = require("wolf_utils/utils.js")

export = {
    interaction: (interaction) =>  {
        return run(interaction.guild.id, interaction.options.getInteger("iterations", false) || 1)
    },
    slash: require("./slash").addSubcommand(sub => {
        sub.setName("shuffle")
        sub.setDescription("Shuffles the Queue")
        sub.addIntegerOption(iterations => {
            iterations.setName("iterations")
            iterations.setDescription("How many times to shuffle the queue")
            iterations.setRequired(false)
            return iterations
        })
        return sub;
    })
} satisfies import("main/types").Command

let run = (guild_id: string, iterations: number = 1): import("main/types").CommandResult => {
    
    let last = 0
    while (iterations > 0) {
        --iterations;
        last = utils.array.shuffle(queue_data.guild_queues[ guild_id ].queue, queue_data.guild_queues[ guild_id ].cur)
    }
    queue_data.guild_queues[guild_id].cur = 0
    queue_data.guild_queues[guild_id].next = 1
    let temp = queue_data.guild_queues[guild_id].queue[0]
    queue_data.guild_queues[guild_id].queue[0] = queue_data.guild_queues[guild_id].queue[last]
    queue_data.guild_queues[guild_id].queue[last] = temp

    return {
        flag: 's',
        message: 'Queue Shuffled'
    }
}
