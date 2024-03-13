import discord = require("discord.js")
import fs = require("fs")
import path = require("path")
import main = require("./index")
import roles = require("./role_data")
import _random = require("../../libs/random")
let random = new _random(10, 9)
let _: import("main/types").Command= {
    command: (ctx, roleInfo, ..._msg) => {
        let message = _msg.slice(1).join(' ')
        let role: discord.Role = ctx.mentions.roles.first() || ctx.guild.roles.cache.get(roleInfo)
        if (!role) {
            ctx.reply("No role id given or role mentioned")
            return
        } else if (role.managed) {
            ctx.reply("Unable to use this role")
        } else if (!message) {
            ctx.reply("No message given")
        } else if (!ctx.member.permissions.has("ManageRoles")) {
            ctx.reply("You do not have the Manage Roles permission")
        }
        let noperm = () => ctx.reply("You do not have an administrative permission that this role has")
        for (let i of ctx.member.permissions.missing(role.permissions, true)) {
            switch (i) {
                case "Administrator": {
                    noperm()
                    return
                }
                case "BanMembers": {
                    noperm()
                    return
                }
                case "DeafenMembers": {
                    noperm()
                    return
                }
                case "KickMembers": {
                    noperm()
                    return
                }
                case "ManageChannels": {
                    noperm()
                    return
                }
                case "ManageEmojisAndStickers": {
                    noperm()
                    return
                }
                case "ManageEvents": {
                    noperm()
                    return
                }
                case "ManageGuild": {
                    noperm()
                    return
                }
                case "ManageMessages": {
                    noperm()
                    return
                }
                case "ManageNicknames": {
                    noperm()
                    return
                }
                case "ManageRoles": {
                    noperm()
                    return
                }
                case "ManageThreads": {
                    noperm()
                    return
                }
                case "ManageWebhooks": {
                    noperm()
                    return
                }
                case "ModerateMembers": {
                    noperm()
                    return
                }
                case "MoveMembers": {
                    noperm()
                    return
                }
                case "MuteMembers": {
                    noperm()
                    return
                }
                case "ViewGuildInsights": {
                    noperm()
                    return
                }
                case "ViewAuditLog": {
                    noperm()
                    return
                }
            }
        }
        run(role, message, ctx.reply)
        return {flag: "n", message: ''}
    },
    slash: main.slash.addSubcommand(sub => {
        sub.setName("create")
        sub.setDescription("Creates a role selector")
        sub.addRoleOption(role => {
            role.setName("role")
            role.setDescription("the role to give")
            role.setRequired(true)
            return role
        })
        sub.addStringOption(message => {
            message.setName("message")
            message.setDescription("The message to display")
            message.setRequired(true)
            return message
        })
        return sub
    }),
    interaction: (interaction) => {
        run(interaction.options.getRole("role", true), interaction.options.getString("message", true), (m) => {
            return interaction.channel.send(m)
        })
        return {flag: "n", message: ""}
    },
    description: "Creates a react role",
    usage: "react_roles create <role> <message>",
    level: "admin"
}


let run = (role: discord.Role | discord.APIRole, message: string, reply: (message: string | discord.MessageOptions) => Promise<any>) => {
    let id = `react-${random.alphaNum(true)}`
    reply({
        content: message,
        components: [
            new discord.ActionRowBuilder<discord.SelectMenuBuilder>().addComponents(new discord.SelectMenuBuilder()
                .setMaxValues(2)
                .setMinValues(0)
                .setCustomId(id)
                .setPlaceholder("Nothing Selected")
                .addOptions(
                    new discord.SelectMenuOptionBuilder()
                        .setLabel("add")
                        .setDescription("an option to add a role")
                        .setValue("add"),
                    new discord.SelectMenuOptionBuilder()
                        .setLabel(role.name)
                        .setValue(role.id),
                )
            )
        ]
    })
    // roles.addReact(id, role.name, role.id)
}

export = _
