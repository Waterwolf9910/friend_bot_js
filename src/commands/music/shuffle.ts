import queue_data = require("./queues")
import utils = require("../../libs/utils")
let _: import("main/types").Command= {
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
    }),
    description: "Shuffles the Queue",
    usage: "music shuffle [iterations]"
}

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

export = _
