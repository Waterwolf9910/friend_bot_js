import fs = require("fs")

for (let i of fs.readdirSync(__dirname).filter(v => v.endsWith(".js"))) {
    require(`./${i}`)
}

export = {
    slash: require("./slash"),
    description: "adds commands to manage experience"
}
