import fs = require("fs")
// import path = require("path")

// let commandList: string[] = []
// let slashes
// for (let i of fs.readdirSync(__dirname, {withFileTypes: true})) {
//     if (i.isFile() && i.name.endsWith(".js") && !i.name.includes("queues") && !i.name.includes("index")) {
//         commandList.push(i.name.replace(".js", ""))
//     }
// }

// module.exports.commandList = commandList
// module.exports.description = "A command to control music"

for (let i of fs.readdirSync(__dirname).filter(v => v.endsWith(".js"))) {
    require(`./${i}`)
}

export = {
    // commandList,
    slash: require("./slash"),
    description: "A command to control music"
}

// export = module.exports
