import db = require("../../libs/db")
import discord = require("discord.js")

export = {
    interaction: async (interaction) => {
        let smember: import("discord.js").GuildMember = interaction.options.getMember("member")
        return await run(interaction.guild, interaction.member, smember,
            interaction.channel,
            interaction.options.getInteger("amount", true))
    },
    slash: require("./slash").addSubcommand(sub => {
        sub.setName("add")
        sub.setDescription("adds xp to a user")
        sub.addIntegerOption(amount => {
            amount.setName("amount")
            amount.setDescription("the amount to modify xp by")
            amount.setRequired(true)
            return amount
        })
        sub.addUserOption(member => {
            member.setName("member")
            member.setDescription("the user to modify")
            member.setRequired(false)
            return member
        })
        return sub
    })
} satisfies import("main/types").Command

let run = async (guild: discord.Guild, member: discord.GuildMember, selected_member: discord.GuildMember, channel: discord.GuildTextBasedChannel, amount: number): Promise<import("main/types").CommandResult> => {
    let [guild_config] = await db.guild_configs.findOrCreate({ where: { id: guild.id } })
    let xp = guild_config.xp
    let current_xp = xp[ selected_member.id ] || 0
    let manager = false

    for (let id of guild_config.econ_managers) {
        if (member.id == id) {
            manager = true
        }
    }

    if (!member.permissions.has(discord.PermissionFlagsBits.ModerateMembers, true) && !manager) {
        return { flag: 'r', message: "You do not have permission to change xp" }
    }

    if (isNaN(amount)) {
        return { flag: 'r', message: `${amount} is not a number` }
    }
    
    xp[selected_member.id] = current_xp + amount
    guild_config.xp = xp

    try {
        await guild_config.save()
        channel.send(`${selected_member.displayName} now has ${current_xp + amount} xp (was ${current_xp})`)
    } catch {
        return { flag: 'r', message: 'Unable to change xp'}
    }
}
