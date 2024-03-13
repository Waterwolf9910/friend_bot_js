import db = require("../../../src/libs/db")
import util = require("util")
import main = require("./index")
import discord = require("discord.js")
let _: import("../../../src/types").Command= {
    // command: async (ctx, key) => {
    //     //@ts-ignore
    //     return await run(ctx.guild, ctx.member, ctx.channel, key)
    // },
    interaction: async (interaction) => {
        //@ts-ignore
        let member: discord.GuildMember = interaction.member
        //@ts-ignore
        return await run(interaction.guild, member, interaction.channel, interaction.options.getString("key", false))
    },
    slash: main.slash.addSubcommand(sub => {
        sub.setName("get")
        sub.setDescription("Gets the guild's config")
        sub.addStringOption(key => {
            key.setName("key")
            key.setDescription("The config key to get")
            key.setRequired(false)
            return key;
        })
        return sub
    }),
    level: "admin",
    description: "Gets the guild's config",
    usage: "config get"
}

let run = async (guild: discord.Guild, member: discord.GuildMember, channel: discord.GuildTextBasedChannel, key: string): Promise<import('../../../src/types').CommandResult> => {
    let [ guild_config ] = (await db.guild_configs.findOrCreate({ where: { id: guild.id } }))
    let manager = false
    for (let i of guild_config.config_managers) {
        if (member.id == i) {
            manager = true;
        }
    }

    if (!manager && !member.permissions.has("ManageGuild", true)) {
        return { flag: 'r', message: "You do not have permission to use this command" };
    }

    let pages: discord.EmbedBuilder[] = []
    let field_amount = 0
    let embed = new discord.EmbedBuilder({
        footer: {
            text: `Requested by ${member.displayName}`,
        },
        color: discord.resolveColor("Gold"),
        title: "Config",
    })

    if (guild_config[ key ] || guild_config.other[ key ]) {
        return { flag: 'r', message: `${key}: ${guild_config[ key ] || guild_config.other[ key ]}` }
    } else {
        for (let config_key of Object.keys(guild_config.get())) {
            if (config_key == "createdAt" || config_key == "updatedAt" || config_key == "other" || config_key == "id") { continue; }
            if (field_amount >= 10) {
                pages.push(embed)
                embed = new discord.EmbedBuilder({
                    footer: {
                        text: `Requested by ${member.displayName}`,
                    },
                    color: discord.resolveColor("Gold"),
                    title: "Config",
                })
                field_amount = 0
            }
            if (typeof guild_config[ config_key ] == "object") {
                embed.addFields({name: config_key, value: JSON.stringify(guild_config[ config_key ]), inline: false})
                // returner += `${config_key}: ${JSON.stringify(guild_config[ config_key ], null, 4).replace(/{/, '').replace(/}/, '').replace(/\[/, '').replace(/\]/, '')}\n;`
            } else {
                embed.addFields({ name: config_key, value: util.format(guild_config[ config_key ]), inline: false })
                // returner += `${config_key}: ${util.format(guild_config[ config_key ])}\n;`
            }
            field_amount++
        }
        for (let config_key of Object.keys(guild_config.other)) {
            if (field_amount >= 10) {
                pages.push(embed)
                embed = new discord.EmbedBuilder({
                    footer: {
                        text: `Requested by ${member.displayName}`,
                    },
                    color: discord.resolveColor("Gold"),
                    title: "Config",
                })
                field_amount = 0
            }
            if (typeof guild_config.other[ config_key ] == "object") {
                embed.addFields({ name: config_key, value: JSON.stringify(guild_config.other[ config_key ]), inline: false })
                // returner += `${config_key}: ${JSON.stringify(guild_config.other[ config_key ], null, 4).replace(/{/, '').replace(/}/, '').replace(/\[/, '').replace(/\]/, '')}\n;`
            } else {
                embed.addFields({ name: config_key, value: util.format(guild_config.other[ config_key ]), inline: false })
                // returner += `${config_key}: ${util.format(guild_config.other[ config_key ])}\n;`
            }
            field_amount++
        }
        if (field_amount > 0) {
            pages.push(embed)
        }
    }

    let msg = await channel.send({embeds: [pages[0]]})
    
    let active_page = 0;
    let updateConfig = () => {
            msg.react("⬅️").then(() => {
            msg.react("➡️").catch(() => null)
        }).catch(() => null)
        msg.awaitReactions({ time: 300000, maxEmojis: 1, filter: (re, user) => user.id == member.id, errors: [ "time" ] }).then(async col => {
            msg.reactions.removeAll().catch(() => null)
    
            if (col.first().emoji.name === "⬅️") {
                if (active_page <= 0) {
                    active_page = pages.length
                }
                active_page--
            } else if (col.first().emoji.name === "➡️") {
                if (active_page <= pages.length -1) {
                    active_page = -1
                }
                active_page++
            } else {
                msg.delete().catch(() => null)
                return
            }
            msg = await msg.edit({embeds: [pages[active_page]]})
            updateConfig()
        }).catch(() => {
            msg.delete().catch(() => null)
        })
    }

    updateConfig()
    return { flag: 'n' }
}
// module.exports = _

export = _

