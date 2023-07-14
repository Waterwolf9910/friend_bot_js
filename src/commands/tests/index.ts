import fs = require("fs")
let commandList: string[] = []
for (let i of fs.readdirSync(__dirname, { withFileTypes: true })) {
    if (i.isFile() && i.name.endsWith(".js") && i.name !== "index.js") {
        commandList.push(i.name.replace(".js", ""))
    }
}
module.exports.commandList = commandList
module.exports.description = "A list of test commands for the bot"

export = {
    commandList,
    description: "A list of test commands for the bot"
}
