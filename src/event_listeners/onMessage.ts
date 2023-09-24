import discord = require("discord.js")
import db = require("../libs/db")
import fs = require('fs')
import path = require("path")
let _: import("../types").event<discord.Events.MessageCreate> = {
    name: discord.Events.MessageCreate,
    function: async (config, client, ctx) => {
        try {
            // ctx = await ctx.fetch()

            if (ctx.author.bot) { return } // Disable usage of bot accounts

            if (ctx.channel.type == discord.ChannelType.DM) { // No DM support for now
                ctx.channel.send("I'm sorry, but im can't do commands in my dm's")
                return;
            }

            // @ts-ignore
            let guild_config: import("./types").Guild_Config = { // Fallback config
                econ_managers: [],
                id: ctx.guild.id,
                money: {},
                xp: {},
                other: {}
            }
            try { // Get config for guild
                [ guild_config ] = await db.guild_configs.findOrCreate({ where: { id: ctx.guild.id } })
            } catch {
                db.sequelize.sync()
            }

            for (let iplugin of fs.readdirSync(path.resolve("..", "internal_plugins")).filter(file => file.endsWith(".js"))) {
                try {
                    if (config.DisabledPlugins.includes(iplugin.replace(".js", ''))) {
                        return
                    }
                    require(`../internal_plugins/${iplugin}`).run(ctx, guild_config)
                } catch (err) {
                    console.error(`Internal Plugin Error (${iplugin.replace(".js", " ")}): \n${err}`)
                }
            }
            for (let plugin of fs.readdirSync(path.resolve("plugins")).filter(file => file.endsWith(".js"))) {
                try {
                    if (config.DisabledPlugins.includes(plugin.replace(".js", ''))) {
                        return
                    }
                    require(`./plugins/${plugin}`).run(ctx, guild_config)
                } catch (err) {
                    console.log(`Plugin Error (${plugin.replace(".js", " ")}): \n${err}`)
                }
            }
            if (ctx.mentions.users.has(client.user.id) && !ctx.content.toLowerCase().startsWith(guild_config.prefix.toLowerCase())) { // Basic help commands
                ctx.reply(`Hello ${ctx.author.username} i am ${client.user.username}
    slash commands are available,
    click under my icon after typing slash to see them all`).catch(() => null)
                return;
            }
        } catch (err) {
            console.error("Error within command handler:", err)
        }
    }
}

export = _
