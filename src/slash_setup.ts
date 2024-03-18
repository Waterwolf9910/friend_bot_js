import discord = require("discord.js")
import _rest = require("@discordjs/rest")
import commands = require("./commands")
import { RESTPostAPIApplicationCommandsJSONBody } from "discord.js"
import fs = require('fs')
let rest = new _rest.REST({})

let setup = async (token: string, config: import("./types").Config) => {
    // commands.setup()
    if (!config.ClientId || config.ClientId == "INSERT APP ID") {
        console.error("No app id found in config, slash commands will not be registered")
        return
    }
    rest.setToken(token)
    let body: RESTPostAPIApplicationCommandsJSONBody[] = []
    for (let group in commands.groups) {
        body.push(commands.groups[ group ].slash.toJSON())
    }
    for (let cmd in commands.cmds) {
        body.push(commands.cmds[cmd].slash.toJSON())
    }
    /* let admin = new discord.SlashCommandBuilder().setName("bot_owner").setDescription("some commands for the owner of the bot")
    admin.addSubcommand((sub) => {
        return sub
            .addStringOption(input => {
                return input
                    .setName("input")
                    .setDescription("the code to run")
                    .setRequired(true)

            })
            .setName("eval")
            .setDescription("runs code under the bot")
    })
    body.push(admin.toJSON())*/
    if (body.length > 0) {
        try {
            await rest.put(discord.Routes.applicationCommands(config.ClientId), {body})
            console.log("Slash commands registered")
        } catch (err) {
            console.writeError(err)
            if (err?.requestBody) {
                console.writeError('error:', err.requestBody.json)
                for (let i of err.requestBody.json) {
                    console.writeDebug(i.name)
                    for (let options of i.options) {
                        console.writeDebug('    ', options)
                    }
                }
            }
            console.error("error registering slash commands")
        }
    } else {
        console.error("No slash commands found")
    }
}

export = {
    setup
}
