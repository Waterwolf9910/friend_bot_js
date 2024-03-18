import fs = require("fs")

for (let i of fs.readdirSync(__dirname).filter(v => v.endsWith(".js"))) {
    require(`./${i}`)
}

export = {
    // commandList,
    slash: require("./slash"),
    description: "A command to control music"
}
