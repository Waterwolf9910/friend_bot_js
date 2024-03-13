import fs = require("fs")
import path = require("path")
let config: import("main/types").Config = JSON.parse(fs.readFileSync(path.resolve("config.json"), { encoding: 'utf-8' }))
import db = require("main/libs/db")
let _: import("main/types").Command = {
    interaction: async (interaction) => {
        let member: import('discord.js').GuildMember = interaction.options.getMember("member") || interaction.member
        return await run(interaction.guild.id, interaction.member, member, interaction.options.getInteger("amount", true))
    },
    slash: require("./slash").addSubcommand(sub => {
        sub.setName("set")
        sub.setDescription("Sets users current bal")
        sub.addIntegerOption(amount => {
            amount.setName("amount")
            amount.setDescription("the amount to set")
            amount.setRequired(true)
            return amount
        })
        sub.addUserOption(member => {
            member.setRequired(false)
            member.setName("member")
            member.setDescription("The user to add to")
            return member
        })
        return sub
    }),
    description: "Sets the users current bal",
    usage: "econ add <amount> [user]"
}

let run = async (guild_id: string, author: import('discord.js').GuildMember, selector_member: import('discord.js').GuildMember, amount: string | number): Promise<import('main/types').CommandResult> => {
    let manager = false
    let [ guild_config ] = (await db.guild_configs.findOrCreate({ where: { id: guild_id } }))
    let selector = selector_member.id
    let money = guild_config.money
    let current_bal = money[ selector ] || 1000
    // console.log(current_bal)

    for (let i of guild_config.econ_managers) {
        if (author.id == i) {
            manager = true
        }
    }
    if (!selector_member.permissions.has("ModerateMembers", true) && !manager) {
        return { flag: 'r', message: "You do have the correct permissions to change the economy!" }
    }
    //@ts-ignore
    if (isNaN(parseInt(amount))) {
        return { flag: 'r', message: `${amount} is not a number` }
    }
    let returner: string //= "Unable to get value of this user"
    //@ts-ignore
    money[ selector ] = parseInt(amount)
    guild_config.money = money
    try {
        await guild_config.save()
        returner = `${selector_member.displayName} now has ${guild_config.money[ selector ]} ${config.BaseCurrencyName} (was ${current_bal})`
    } catch {
        returner = `Unable to change bal`
    }
    return { flag: 'r', message: returner }
}

module.exports = _

export = _
