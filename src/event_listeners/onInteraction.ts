import events = require("../events")
import util = require("util")
import discord = require("discord.js")

let _: import("../types").event<discord.Events.InteractionCreate> = {
    name: discord.Events.InteractionCreate,
    function: async (config, _client,  interaction) => {
        if (interaction.user.bot) { return }
        if (interaction.isStringSelectMenu()) {
            // await interaction.deferReply({})
            events.emit("menu", interaction)
        }
        if (!interaction.isChatInputCommand()) { return }
        await interaction.deferReply({})
        try {

            let command = interaction.commandName
            let subcommand = interaction.options.getSubcommand(false)

            let cmd: import("../types").Command= subcommand ? require(`../commands/${command}/${subcommand}`) : require(`../commands/${command}`)
            
            if (cmd.interaction == undefined) {
                return;
            }
            
            let result = await cmd.interaction(interaction)
            if (result.message == undefined) {
                result = {
                    flag: 'n',
                }
            }
            switch (result.flag) {
                case "r": {
                    interaction.editReply(result.message)
                    break
                }
                case "s": {
                    interaction.channel.send(result.message)
                    interaction.deleteReply()
                    break
                }
                case "n": {
                    await interaction.editReply("Success")
                    setTimeout(() => {
                        interaction.deleteReply()
                    }, 1500)
                    break
                }
            }

        } catch (err) {
            console.error("Error within interaction handler: ", err)
        }
        // console.log(interaction, interaction.commandName, interaction.options.getSubcommand(false))
        // await interaction.editReply("Test")
        // setTimeout(() => {
        //     interaction.deleteReply()
        // }, 3000)
    }
}

export = _
