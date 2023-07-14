import discord = require("discord.js")
// import fs = require("fs")
// let commandList: string[] = []
// for (let i of fs.readdirSync(__dirname, {withFileTypes: true})) {
//     if (i.isFile() && i.name.endsWith(".js") && i.name !== "index.js") {
//         commandList.push(i.name.replace(".js", ""))
//     }
// }

// module.exports.commandList = commandList
// module.exports.description = "A way to manage settings for the server"
// module.exports.usage = "config get"
// module.exports.Command= require("./get").command

export = {
    slash: new discord.SlashCommandBuilder()
        .setName("config")
        .setDescription("A way to manage settings for the server")
    ,
    // commandList,
    description: "A way to manage settings for the server",
    // command: require("./get").command
}
