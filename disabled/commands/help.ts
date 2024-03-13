// let cmdList: { cmd: typeof import("./index").commandList, group: typeof import("./index").commandListGroup } = {cmd: require("./index").commandList, group: require("./index").commandListGroup}
import cmdList = require("./index")
import fs = require("fs")
import path = require("path")
// console.log(cmdList)
cmdList.setup()
// console.log(cmdList)
let defaultHelp = () => {
    let returner = `help: Prints this message\n`
    for (let cmd in cmdList.cmd) {
        if (cmd != "help" && cmd != "help.js" && require(`./${cmd}`).description) {
            returner += `${cmd.replace(".js", '')} [args]: ${require(`./${cmd}`).description} [perm level: ${require(`./${cmd}`).level || "user"}]\n`
        }
    }
    for (let cmdGroup in cmdList.group) {
        let subCMD = cmdList.group[cmdGroup].cmds
        returner += `${cmdGroup} <subcommand> [args]: ${require(`./${cmdGroup}`).description}\n`
        for (let cmd in subCMD) {
            if (require(`./${cmdGroup}/${cmd}`)?.description) {
                returner += `    ${cmd} [args]: ${require(`./${cmdGroup}/${cmd}`).description} [perm level: ${require(`./${cmdGroup}/${cmd}`).level || "user"}]\n`
            }
        }
    }
    return returner
}
let _: import("main/types").Command= {
    command: (_ctx, cmd, sub) => {
        let returner = ""
        let valid: boolean | "partial" = false
        if (cmd) {
            if (sub) {
                for (let cmdGroup in cmdList.group) {
                    if (cmd == cmdGroup/*  || `${cmd}.js` == cmdGroup.name */) {
                        valid = "partial"
                        // if (!require(`./${cmd}`).commandList) {
                        //     return { flag: 'r', message: `This command does not accept subcommands.\n ${cmd}:${require(`./${cmd}`).description}` }
                        // }

                        for (let x in cmdList.group[cmdGroup].cmds) {
                            if (sub == x/*  || `${sub}.js` == x.name */ && require(`./${cmd}/${sub}`).usage) {
                                valid = true
                                returner = `${cmd} ${sub}: ${require(`./${cmd}/${sub}`).usage}`
                            }
                        }
                        if (!valid) {
                            returner = `${sub} is not a valid subcommand for ${cmd}`
                        }
                    }
                }
            } else {
                for (let i in cmdList.cmd) {
                    if (cmd == i/*  || `${cmd}.js` == i*/) {
                        valid = true
                        if (require(`./${cmd}`).usage) {
                            returner = `${cmd}: ${require(`./${cmd}`).usage}`
                        }
                    }
                }
                for (let i in cmdList.group) {
                    if (cmd == i/*  || `${cmd}.js` == i.name */) {
                        valid = "partial"
                    }
                }
                if (!valid) {
                    for (let i of [ ...fs.readdirSync(path.resolve("./plugins")), ...fs.readdirSync("./internal_plugins") ]) {
                        if (cmd == i || `${cmd}.js` == i) {
                            return { flag: 'n', message: "" }
                        }
                    }
                    returner = `${cmd} is not a valid command`
                }
            }
        } else {
            returner = defaultHelp()
            valid = true
        }
        
        if (!valid) {
            for (let i of [ ...fs.readdirSync(path.resolve("./plugins")), ...fs.readdirSync("./internal_plugins") ]) {
                if (cmd == i || `${cmd}.js` == i) {
                    return { flag: 'n', message: "" }
                }
            }
            returner = `${cmd} is not a valid command`
        } else if (valid == "partial") {
            let getSubHelp = () => {
                let response = `${cmd}: ${require(`./${cmd}`).description}\n`
                
                for (let i in cmdList.group[cmd].cmds) {
                    if (require(`./${cmd}/${i}`).description) {
                        response += `    ${i}: ${require(`./${cmd}/${i}`).description}\n`
                    }
                }
                return response
            }
            returner = sub ? `${sub} is not a valid subcommand of ${cmd}\n${getSubHelp()}` : `This command requires a subcommand\n${getSubHelp()}`
        }
        
        return { flag: "s", message: returner }
    },
    description: defaultHelp(),
    usage: "help"
}
module.exports = _
export = _

