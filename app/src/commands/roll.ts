import discord = require("discord.js")
import _random = require("wolf_utils/random.js")

let random = _random.createRandom(0, 6)
export = {
    interaction: (interaction) => {
        let options = interaction.options
        return {flag: 's', message: `Your roll: ${random.num(
            options.getInteger('max', false) ?? 6,
            options.getInteger('min', false) ?? 0
        )}`}
    },
    slash: new discord.SlashCommandBuilder()
        .setName("roll")
        .setDescription("Rolls a virtual dice")
        .addIntegerOption(max => {
            max.setName("max")
            max.setDescription("Sets the max value of 'dice'")
            max.setRequired(false)
            return max
        })
        .addIntegerOption(min => {
            min.setName("min")
            min.setDescription("Sets the min value of 'dice'")
            min.setRequired(false)
            return min
        })
} satisfies import("main/types").Command

