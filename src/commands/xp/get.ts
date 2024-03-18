import db = require("../../libs/db")
import discord = require("discord.js")

export = {
    interaction: async (interaction) => {
        let smember: import("discord.js").GuildMember = interaction.options.getMember("member")
        return await run(interaction.guild, smember)
    },
    slash: require("./slash").addSubcommand(sub => {
        sub.setName("get")
        sub.setDescription("gets the xp of a user")
        sub.addUserOption(member => {
            member.setName("member")
            member.setDescription("the user to modify")
            member.setRequired(false)
            return member
        })
        return sub
    })
} satisfies import("main/types").Command

let run = async (guild: discord.Guild, selected_member: discord.GuildMember): Promise<import("main/types").CommandResult> => {
    let [guild_config] = await db.guild_configs.findOrCreate({ where: { id: guild.id } })
    let xp = guild_config.xp
    let current_xp = xp[ selected_member.id ] || 0

    return { flag: 's', message: `${selected_member.displayName} has ${current_xp})` }
}
