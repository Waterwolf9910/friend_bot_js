import fs = require("fs")
import discord = require('discord.js')
// let commandList: string[] = []
// for (let i of fs.readdirSync(__dirname, {withFileTypes: true})) {
//     if (i.isFile() && i.name.endsWith(".js") && i.name !== "index.js") {
//         commandList.push(i.name.replace(".js", ""))
//     }
// }

// module.exports.commandList = commandList
// module.exports.description = "A way to manage economy on the server"
// module.exports.usage = "econ or econ bal"
// module.exports.Command= require("./bal").command

for (let i of fs.readdirSync(__dirname).filter(v => v.endsWith(".js"))) {
    require(`./${i}`)
}

export = {
    // commandList,
    slash: require("./slash"),
    description: "A way to manage economy on the server",
    interaction: (interaction) => require("./bal").interaction(interaction),
}
