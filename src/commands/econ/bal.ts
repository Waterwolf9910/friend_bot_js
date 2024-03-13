import fs = require("fs")
import path = require("path")
let config: import("main/types").Config = JSON.parse(fs.readFileSync(path.resolve("config.json"), { encoding: 'utf-8' }) )
import db = require("main/libs/db")
let _: import("main/types").Command = {
    interaction: async (interaction) => {
        let member: import("discord.js").GuildMember = interaction.options.getMember("member") || interaction.member
        return await run(interaction.guild.id, member)
    },
    slash: require("./slash").addSubcommand(sub => {
        sub.setName("get")
        sub.setDescription("Gets the users current bal")
        sub.addUserOption(member => {
            member.setRequired(false)
            member.setName("member")
            member.setDescription("The user to check")
            return member
        })
        return sub
    }),
    description: "Gets the users current bal",
    usage: "econ or econ bal [user] or econ get [user]"
}

let run = async (guild_id: string, member: import('discord.js').GuildMember): Promise<import('main/types').CommandResult> => {
    let returner = "Unable to get value of this user"
    let [ guild_config ] = (await db.guild_configs.findOrCreate({ where: { id: guild_id } }))
    let selector_member = member
    let selector = selector_member.id
    let current_bal = guild_config.money[ selector ] || 1000
    let money = guild_config.money

    if (!guild_config.money[ selector ]) {
        money[ guild_id ] = 1000
        guild_config.money = money
        try {
            await guild_config.save()
        } catch { }
    }
    returner = `${selector_member.displayName} has ${current_bal} ${config.BaseCurrencyName}`
    return { flag: 's', message: returner }
}

module.exports = _

export = _
