import queue_data = require("./queues")
import utils = require("../../libs/utils")
let _: import("../../types").Command= {
    // command: (ctx, iterations) => {
    //     return run(ctx.guild.id, parseInt(iterations))
    // },
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

let run = (guildId: string, iterations: number = 1): import("../../types").CommandResult => {
    
    while (iterations > 0) {
        --iterations;
        queue_data.guild_queues[ guildId ].cur = utils.array.shuffle(queue_data.guild_queues[ guildId ].queue, queue_data.guild_queues[ guildId ].cur)
    }
    queue_data.guild_queues[guildId].next = queue_data.guild_queues[guildId].cur+1

    return {
        flag: 's',
        message: 'Queue Shuffled'
    }
}

export = _
