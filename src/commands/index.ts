import fs = require("fs")
import path = require("path")
import types = require("main/types")
let commandListGroup: {
    [ name: string ]: {
        slash: types.Command['slash']
    }
} = {}
let commandList: {
    [ name: string ]: {
        slash: types.Command['slash']
    }
} = {}
for (let i of fs.readdirSync(__dirname, { withFileTypes: true })) {
    // console.log(i)
    if (i.isDirectory()) {
        let fullDir = path.resolve(__dirname, i.name)
        let cmd: types.Command
        try {
            cmd = require(fullDir)
        } catch { continue }
        
        if (!cmd.slash) {
            continue
        }
        commandListGroup[i.name] = {
            slash: cmd.slash
        } 
    } else if (i.isFile() && i.name.endsWith(".js") && i.name != "index.js") {
        let cmd: import("main/types").Command = require(`./${i.name}`)
        if (!cmd.slash) {
            continue;
        }
        commandList[i.name.replace(".js", "")] = {
            slash: cmd.slash
        }
    }
}

export = {
    setup: () => {},
    cmds: commandList,
    groups: commandListGroup
}
