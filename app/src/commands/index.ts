import fs = require("fs")
import path = require("path")
import types = require("main/types")
// let groups: {
//     [name: string]: {
//         slash: types.Command['slash']
//     }
// } = {}
// let cmds: {
//     [name: string]: {
//         slash: types.Command['slash']
//     }
// } = {}

let packaged = false
try {
    eval("packaged = __webpack_modules__ != undefined")
} catch { }

let cmds: types.Command['slash'][] = []

// let _context = require.context(".", true, /.ts$/, "sync")
// for (let _ of _context.keys()) {
    //     _context(_)
    // }
    
let all_cmds: string[] = []
let _require: __WebpackModuleApi.RequireContext | NodeJS.Require
if (packaged) {
    let context = require.context(".", true, /.ts$/, "sync")
    all_cmds = context.keys()
    _require = context
} else {
    all_cmds = fs.readdirSync('.', { recursive: true, encoding: "utf-8" })
    _require = require
}
for (let command of all_cmds) {
    let cmd = _require<types.Command>(command)
    if (!cmd.slash) {
        continue
    }

    if (command.replace("/index.ts", '').split("/").length > 2) {
        continue
    }

    // cmds[command.replace("./", '')] = {
    //     slash: cmd.slash
    // }
    cmds.push(cmd.slash)
}

export = cmds
// export = {
//     setup: () => null,
//     cmds
// }
