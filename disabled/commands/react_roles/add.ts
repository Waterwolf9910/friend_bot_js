import role_data = require("./role_data")
import discord = require("discord.js")
let _: import("main/types").Command= {
    command: (ctx, id) => {
        let role = ctx.mentions.roles.first()
        if (!id) {
            ctx.reply("No Edit Id found")
        } else if (!role) {
            ctx.reply("No Role found")
        }
        return run(ctx.author.id, `react-${id}`, role)
    },
    slash: main.slash.addSubcommand(sub => {
        sub.setName("add")
        sub.setDescription("Adds a role to an existing table")
        sub.addStringOption(id => {
            id.setName("id")
            id.setDescription("The id of the table")
            id.setMaxLength(10)
            id.setMinLength(10)
            id.setRequired(true)
            return id
        })
        sub.addRoleOption(role => {
            role.setName("role")
            role.setDescription("The role to add")
            role.setRequired(true)
            return role
        })

        return sub
    }),
    interaction: interaction => {
        return run(interaction.user.id, `react-${interaction.options.getString("id", true)}`, interaction.options.getRole("role", true))
    },
    level: "admin",
    description: "Adds a role to an existing table",
    usage: "add <id> <role>"
}

let run = (user_id: string, id: `react-${string}`, role: discord.Role | discord.APIRole): import("main/types").CommandResult => {
    let data = role_data.updateList[id]
    if (!data) {
        return {flag: 'r', message: 'No such active edit id'}
    } else if (data.user_id !== user_id) {
        return {flag: 'r', message: 'You are not the user who requested an edit'}
    }
    let row = new discord.ActionRowBuilder<discord.SelectMenuBuilder>().addComponents(
        new discord.SelectMenuBuilder()
        .setCustomId(id)
        .setMaxValues(data.component.options.length)
        .setMinValues(0)
        .setPlaceholder(data.component.placeholder)
        .addOptions(
            ...data.component.options,
            new discord.SelectMenuOptionBuilder()
                .setLabel(role.name)
                .setValue(role.id)
        )
    )
    data.interaction.editReply({content: data.message, components: [row]})
    delete role_data.updateList[id]
    return { flag: 'n', message: "" }
}

export = _
