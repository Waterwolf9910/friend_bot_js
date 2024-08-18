import events = require("../events")
import util = require("util")
import discord = require("discord.js")

let _: import("main/types").event<discord.Events.InteractionCreate> = {
    name: discord.Events.InteractionCreate,
    function: async (_config, _client,  interaction: discord.Interaction<'cached'>) => {
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

            let cmd: import("main/types").Command = subcommand ? require(`../commands/${command}/${subcommand}`) : require(`../commands/${command}`)
            
            if (cmd.interaction == undefined) {
                return;
            }
            
            let result = await cmd.interaction(interaction)
            if (result == undefined || result.message == undefined) {
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
            console.error("Error within interaction handler: ", {
                command: interaction.command,
                sub: interaction.options.getSubcommand(false),
                err
            })
            interaction.editReply("There was an error while trying to run this command")
        }
    }
}

export = _
