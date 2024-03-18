import queue_data = require("./queues")
import utils = require("myutils/utils.js")

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
    
    while (iterations > 0) {
        --iterations;
        queue_data.guild_queues[ guild_id ].cur = utils.array.shuffle(queue_data.guild_queues[ guild_id ].queue, queue_data.guild_queues[ guild_id ].cur)
    }
    queue_data.guild_queues[guild_id].next = queue_data.guild_queues[guild_id].cur+1

    return {
        flag: 's',
        message: 'Queue Shuffled'
    }
}
