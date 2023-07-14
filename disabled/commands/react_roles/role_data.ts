import events = require("../../events")
import fs = require("fs")
import path = require("path")
import discord = require("discord.js")
// let reactData: import("../../types").Reacts = {}
// if (fs.existsSync(path.resolve("./reacts.json"))) {
//     reactData = JSON.parse(fs.readFileSync(path.resolve("./reacts.json"), {encoding: 'utf-8'}))
// } else {
//     fs.writeFileSync(path.resolve("./reacts"), JSON.stringify({}))
// }
let updateList: { [id: `react-${string}`]: {interaction: discord.SelectMenuInteraction, user_id: string, component: discord.SelectMenuComponent | discord.APISelectMenuComponent, message: string } } = {}

let onMenu = async (interaction: import("discord.js").SelectMenuInteraction) => {
    if (!interaction.customId.startsWith("react-")) {
        return
    }
    if (interaction.values.includes("add")) {
        let msg = await interaction.channel.send(`Use /react_roles add now using the following: ${interaction.customId.replace("react-", '')}`)
        interaction.deferUpdate({fetchReply: false})
        module.exports.updateList = {
            ...module.exports.updateList,
            [interaction.customId]: {
                interaction: interaction,
                user_id: interaction.user.id,
                component: interaction.component,
                message: interaction.message.content
            }
        }
        setTimeout(() => {
            msg.delete().catch(() => null)
        }, 25000)
        
        /* let row = new discord.ActionRowBuilder<discord.SelectMenuBuilder>().addComponents(new discord.SelectMenuBuilder().addOptions(
                ...interaction.component.options,
                new discord.SelectMenuOptionBuilder()
                    .setLabel("label")
            )
        )
        interaction.update({content: interaction.message.content, components: [row]}) */

        return
    }
    console.log('a')
    interaction.deferReply()
    console.log('b')
    // interaction.deleteReply()
    // let allValues = []
    //@ts-ignore
    let member: discord.GuildMember = await interaction.guild.members.fetch({ user: interaction.user.id });
    console.log('c')
    for (let role of interaction.component.options) {
        
        if (role.value == "add") {
            continue
        }
        try {
            if (!interaction.values.includes(role.value) && member.roles.cache.has(role.value)) {
                await member.roles.remove(await interaction.guild.roles.fetch(role.value), "User Selected")
            } else if (interaction.values.includes(role.value) && !member.roles.cache.has(role.value)) {
                await member.roles.add(await interaction.guild.roles.fetch(role.value), "User Selected")
            }
        } catch (err) { // Kept throwing errors 
            if (interaction.deferred) {
                interaction.editReply("Error adding role")
            } else {
                try {
                    interaction.reply("Error adding role")
                } catch {
                    interaction.editReply("Error adding role")
                }
            }
            console.writeError(err)
        }
        // allValues.push(role.value)
    }
    console.log('d')
    setTimeout(() => {
        interaction.deleteReply().catch(() => null)
    }, 3000)
    // console.log(interaction.values,  interaction.message.content, allValues)
}

// let addReact = (id: string, role_name: string, role_id: string) =>{
//     reactData[id] = {
//         ...reactData[id],
//         [role_name]: role_id
//     }
// }
events.on("menu", onMenu)

export = {
    updateList
    // reactData,
    // addReact
}
