import fs = require("fs")

for (let i of fs.readdirSync(__dirname).filter(v => v.endsWith(".js"))) {
    require(`./${i}`)
}

export = {
    // commandList,
    slash: require("./slash"),
    description: "A way to manage economy on the server",
    interaction: (interaction) => require("./bal").interaction(interaction),
}
