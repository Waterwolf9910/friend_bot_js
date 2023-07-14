import discord = require('discord.js')
export = new discord.SlashCommandBuilder()
    .setName("econ")
    .setDescription("A way to manage economy on the server")
    .addSubcommand((sub) => {
        sub.setName("run")
        sub.setDescription("Gets the balance")
        sub.addUserOption(selector => {
            selector.setName("selector")
            selector.setDescription("The user to select")
            selector.setRequired(false)
            return selector
        })
        return sub
    })
