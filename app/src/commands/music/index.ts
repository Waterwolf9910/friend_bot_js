// import fs = require("fs")

// for (let i of fs.readdirSync(__dirname).filter(v => v.endsWith(".js"))) {
//     require(`./${i}`)
// }

require("@discordjs/opus")
require("sodium-native")
// console.log(require("@discordjs/voice").generateDependencyReport())
export = {
    // commandList,
    slash: require("./slash"),
    description: "A command to control music"
}
