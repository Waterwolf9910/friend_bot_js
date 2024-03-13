import fs = require("fs")
import path = require("path")
import * as types from "main/types"
let commandListGroup: {
    [ name: string ]: {
        slash: import('discord.js').SlashCommandBuilder | import('discord.js').SlashCommandOptionsOnlyBuilder | import('discord.js').SlashCommandSubcommandsOnlyBuilder
    }
} = {}
let commandList: {
    [ name: string ]: {
        slash: import("discord.js").SlashCommandBuilder | import('discord.js').SlashCommandOptionsOnlyBuilder | import('discord.js').SlashCommandSubcommandsOnlyBuilder
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
        let cmdGroup: import('discord.js').SlashCommandBuilder | import('discord.js').SlashCommandOptionsOnlyBuilder | import('discord.js').SlashCommandSubcommandsOnlyBuilder = cmd.slash
        if (!cmdGroup) {
            continue
        }
        commandListGroup[i.name] = {
            slash: cmdGroup
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
    commandList,
    commandListGroup,
    setup: () => {},
    cmd: commandList,
    group: commandListGroup
}
