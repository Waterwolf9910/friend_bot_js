import fs = require("fs")
import path = require("path")
let config: import("../../types").Config = JSON.parse(fs.readFileSync(path.resolve("config.json"), { encoding: 'utf-8' }))
import db = require("../../libs/db")
let _: import("../../types").Command = {
    interaction: async (interaction) => {
        //@ts-ignore
        let member: import('discord.js').GuildMember = interaction.options.getMember("member") || interaction.member
        //@ts-ignore
        let amember: import('discord.js').GuildMember = interaction.member
        return await run(interaction.guild.id, amember, member, interaction.options.getInteger("amount", true))
    },
    slash: require("./slash").addSubcommand(sub => {
        sub.setName("remove")
        sub.setDescription("Removes from the users current bal")
        sub.addIntegerOption(amount => {
            amount.setName("amount")
            amount.setDescription("the amount to remove")
            amount.setRequired(true)
            return amount
        })
        sub.addUserOption(member => {
            member.setRequired(false)
            member.setName("member")
            member.setDescription("The user to remove from")
            return member
        })
        return sub
    }),
    description: "Removes from the users current bal",
    usage: "econ remove amount [user] or econ del amount [user]"
}

let run = async (guildId: string, author: import('discord.js').GuildMember, selector_member: import('discord.js').GuildMember, amount: string | number): Promise<import('../../types').CommandResult> => {
    let manager = false
    let [ guild_config ] = (await db.guild_configs.findOrCreate({ where: { id: guildId } }))
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
    money[ selector ] = current_bal - parseInt(amount)
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
