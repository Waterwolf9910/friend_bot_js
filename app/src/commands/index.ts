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

let cmds: types.Command[] = []

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
    all_cmds = fs.readdirSync(path.resolve(__dirname, '.'), { recursive: true, encoding: "utf-8", withFileTypes: true }).filter(v => v.name.endsWith('.js') && __filename != `${v.parentPath}/${v.name}`).map(v => `${v.parentPath}/${v.name}`)
    _require = require
}
// let i = 0
// console.log(all_cmds)
for (let command of all_cmds) {
    let cmd =_require<types.Command>(command)

    if (!cmd.slash) {
        continue
    }

    if (command.replace('./', '').replace("/index.ts", '').replace(`${__dirname}/`, '').split("/").length >= 2 && !command.endsWith('index.js')) {
        continue
    }

    // cmds[command.replace("./", '')] = {
    //     slash: cmd.slash
    // }
    cmds.push(cmd)
}

let cmd_list: {[key: string]: types.Command} = {}
for (let command of all_cmds) {
    let cmd = _require<types.Command>(command)

    if (!cmd.slash) {
        continue
    }

    let path = command.replace("/index.ts", '').replace(`${__dirname}/`, '').split("/")

    if (path.length == 1) {
        cmd_list[path[0].replace(/.js$/, '')] = cmd
        continue
    }

    cmd_list[`${path[path.length - 2].replace(/.js$/, '')}.${path[path.length - 1].replace(/.js$/, '')}`] = cmd
}

export = {
    cmds,
    cmd_list
}
// export = {
//     setup: () => null,
//     cmds
// }
