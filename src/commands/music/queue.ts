import queue_data = require("./queues")

let _: import("../../types").Command= {
    // command: async (ctx, _page) => run(ctx.guild.id, ctx.author.id,
    //     //@ts-ignore
    //     ctx.channel,
    //     ctx.member, _page),
    interaction: (interaction) => {
        //@ts-ignore
        return run(interaction.guild.id, interaction.user.id,
            interaction.channel,
            //@ts-ignore
            interaction.member,
            interaction.options.getInteger("queue_page", false) )
    },
    slash: require("./slash").addSubcommand(sub => {
        sub.setName("queue")
        sub.setDescription("Sends the music queue")
        sub.addIntegerOption(queue_page => {
            queue_page.setName("queue_page")
            queue_page.setDescription("The page of the queue")
            queue_page.setRequired(false)
            return queue_page
        })
        return sub
    }),
    description: "Sends the music queue",
    usage: "music queue [page]"
}

let run = async (guildId: string, authorId: string, text_channel: import('discord.js').GuildTextBasedChannel, member: import('discord.js').GuildMember, _page: number | string ): Promise<import('../../types').CommandResult> => {
    let queue = queue_data.guild_queues[ guildId ].queue
    let page = parseInt(`${_page}`)
    if (isNaN(page)) {
        if (_page == undefined) {
            page = 0
        } else {
            return { flag: 'r', message: `${_page} is not a number` }
        }
    }
    let pages: import("discord.js").EmbedField[][] = []
    let page_create = 0
    let iteration = 1
    let cur = queue_data.guild_queues[ guildId ].cur
    if (!queue || queue?.length < 1) {
        return { flag: 'r', message: "There is nothing in the queue" }
    }
    for (let i = 0; i < queue.length; i++) {
        if (iteration > 10) {
            iteration = 1
            page_create++
        }
        if (!pages[ page_create ]) {
            pages[ page_create ] = []
        }
        pages[ page_create ].push({ inline: false, name: `Queue #${i + 1}`, value: `${cur == i ? "**" : ""}[${queue[ i ].title}](${queue[ i ].link})${cur == i ? "**" : ""}` })
        iteration++
    }
    if (page > pages.length) {
        return { flag: 'r', message: `${page} has a greater number than the queue's page.` }
    }
    let queue_msg = await text_channel.send({
        embeds: [ {
            title: "Queue",
            fields: pages[ page - 1 ],
            footer: {
                text: `Page ${page + 1}/${pages.length} | Requested by ${member.displayName}`
            }
        } ]
    })
    let update_queue = async () => {
        page_create = 0
        iteration = 1
        pages = []
        let cur = queue_data.guild_queues[ guildId ].cur
        for (let i = 0; i < queue_data.guild_queues[ guildId ].queue.length; i++) {
            if (iteration > 10) {
                iteration = 1
                page_create++
            }
            if (!pages[ page_create ]) {
                pages[ page_create ] = []
            }
            pages[ page_create ].push({ inline: false, name: `Queue #${i + 1}`, value: `${cur == i ? "**" : ""}[${queue_data.guild_queues[ guildId ].queue[ i ].title}](${queue_data.guild_queues[ guildId ].queue[ i ].link})${cur == i ? "**" : ""}` })
            iteration++
        }
        if (page > pages.length) {
            page = 0
        }
        try {
            // await queue_msg.delete()
            queue_msg = await queue_msg.edit({
                embeds: [ {
                    title: "Queue",
                    fields: pages[ page ],
                    footer: {
                        text: `Page ${page + 1}/${pages.length} | Requested by ${member.displayName}`
                    }
                } ]
            })
            queue_msg.react("⬅️").then(() => {
                queue_msg.react("➡️").catch(() => { })
            }).catch(() => { })
            queue_msg.awaitReactions({ time: 300000, maxEmojis: 1, filter: (re, user) => { return (user.id == authorId) && (re.emoji.name == "⬅️" || re.emoji.name == "➡️") }, errors: [ "time" ] }).then((emoji_col) => {
                queue_msg.reactions.removeAll().catch((e) => { console.log(e) })
                // emoji_col.first().remove().catch(() => { })
                if (emoji_col.first().emoji.name == "⬅️") {
                    page--
                    if (page < 0) {
                        page = pages.length - 1
                    }
                } else if (emoji_col.first().emoji.name == "➡️") {
                    page++
                    if (page > pages.length - 1) {
                        page = 0
                    }
                } else {
                    update_queue()
                }
                // console.log(page)
                update_queue()
            }).catch(() => { })
        } catch { }
    }
    queue_msg.react("⬅️").then(() => {
        queue_msg.react("➡️").catch(() => { })
    }).catch(() => { })
    queue_msg.awaitReactions({ time: 300000, maxEmojis: 1, filter: (re, user) => { return (user.id == authorId) && (re.emoji.name == "⬅️" || re.emoji.name == "➡️") }, errors: [ "time" ] }).then((emoji_col) => {
        queue_msg.reactions.removeAll().catch((e) => { console.log(e) })
        // emoji_col.first().remove().catch(() => { })
        if (emoji_col.first().emoji.name == "⬅️") {
            page--
            if (page < 0) {
                page = pages.length - 1
            }
        } else if (emoji_col.first().emoji.name == "➡️") {
            page++
            if (page > pages.length - 1) {
                page = 0
            }
        } else {
            update_queue()
        }
        update_queue()
    }).catch(() => { })
    return { flag: 'n' }
}

module.exports = _

export = _
