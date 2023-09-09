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

            //@ts-ignore
            /* let guild_config: import("../types").Guild_Config = {
                econ_managers: [],
                id: interaction.guild.id,
                money: {},
                prefix: config.prefix,
                xp: {},
                other: {}
            }
            try {
                guild_config = (await db.guild_configs.findOrCreate({ where: { id: interaction.guild.id } }))[ 0 ]
            } catch {
                db.sequelize.sync()
            } */

            // TODO: Modify plugins to be able to use interactions
            /* for (let iplugin of fs.readdirSync("internal_plugins").filter(file => file.endsWith(".js"))) {
                try {
                    require(`./internal_plugins/${iplugin}`)
                } catch {
                    console.error(`Internal Plugin Error (${iplugin.replace(".js", " ")}): \n${err}`)
                }
            } */

            /* for (let plugin of fs.readdirSync(path.resolve("plugins")).filter(file => file.endsWith(".js"))) {
                try {
                    require(`./plugins/${plugin}`)
                } catch (err) {
                    console.log(`Plugin Error (${plugin.replace(".js", " ")}): \n${err}`)
                }
            } */

            /* if (command == "bot_owner" && interaction.user.id == config.BotOwner) {
                if (interaction.options.getSubcommand() == "eval") {
                    try {
                        let response = await eval(interaction.options.getString("input"))
                        await interaction.editReply(util.format(response))
                    } catch (err) {
                        interaction.editReply(`Error: ${util.format(err)}`).catch(() => null)
                        console.warn(err)
                    }
                }
                return
            } else if (command == "bot_owner") {
                interaction.editReply(`Hey, only <@!${config.BotOwner}> can use this!`)
                return
            } */

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
