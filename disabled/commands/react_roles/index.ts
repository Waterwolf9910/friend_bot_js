import discord = require("discord.js")

export = {
    slash: new discord.SlashCommandBuilder()
        .setName("react_roles")
        .setDescription("Adds commands for a role selector"),
}
