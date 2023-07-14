import db = require("../../libs/db")
import main = require("./index")
let _: import("../../types").Command= {
    // command: (ctx) => {
    //     let returner = "Base"
    //     return {flag: 'n', message: returner}
    // },
    interaction: async (interaction) => {
        //@ts-ignore
        let member: import('discord.js').GuildMember = interaction.member
        return await run(interaction.guild, member, interaction.options.getString("key", true), interaction.options.getString("value", true))
    },
    slash: main.slash.addSubcommand(sub => {
        sub.setName("set")
        sub.setDescription("Sets a value to a config key")
        sub.addStringOption(key => {
            key.setName("key")
            key.setDescription("the config key to set")
            key.setRequired(true)
            return key;
        })
        sub.addStringOption(value => {
            value.setName("value")
            value.setDescription("value for the config key")
            value.setRequired(true)
            return value
        })
        return sub;
    }),
    level: "admin",
    description: "Sets a value to a config key",
    usage: "config set <key> <value>"
}

let run = async (guild: import("discord.js").Guild, member: import('discord.js').GuildMember, key: string, value: string): Promise<import('../../types').CommandResult> => {
    let [ guild_config ] = (await db.guild_configs.findOrCreate({ where: { id: guild.id } }))
    let manager = false
    let isArray: boolean

    for (let manager_id of guild_config.config_managers) {
        if (member.id == manager_id) {
            manager = true
        }
    }

    if (!manager && !member.permissions.has("ManageGuild", true)) {
        return { flag: 'r', message: "You do not have permission to use this command" }
    }

    if (key == "config_manager" || key == "econ_manager") {
        return { flag: 'r', message: "You cannot change these values this way" }
    }

    let valueIsBool = (value == "true" || value == "false")
    let valueIsArrayBool = ((value.includes("true") && value.includes(',')) || (value.includes("false") && value.includes(',')))
    //@ts-ignore
    let valueIsNum = isNaN(value) && value != ""
    //@ts-ignore
    let valueIsArrayNum = (!isNaN(value.charAt(0)) && value.includes(',')) || (!isNaN(value.charAt(1)) && value.includes(','))
    let paths = key.split(".")
    let configHolder: {key: string, val: any}[] = []
    for (let path of paths) {
        let val = configHolder.length == 0 ? guild_config[ path ] : configHolder[ configHolder.length - 1 ].val[ path ]
        if (val == null) {
            return { flag: 'r', message: `Key '${key}' does not exist` }
        }
        configHolder.push({key: path, val })
    }
    configHolder.reverse()
    isArray = configHolder[0].val instanceof Array
    for (let i = 0; i < configHolder.length; i++) {
        let opt = configHolder[i]
        if (i == 0) {
            if ((typeof opt.val == "boolean" || typeof opt.val[0] == "boolean") && (valueIsBool || valueIsArrayBool)) {
                opt.val = isArray ? [...valueIsArrayBool ? value.replace(' ', '').split(",").map(v => v == "true") : [value == "true"]] : valueIsBool ? value == "true" : value.replace(' ', '').split(',')[0] == "true"
            } else if ((typeof opt.val == "number" || typeof opt.val[0] == "number") && (valueIsNum || valueIsArrayNum)) {
                opt.val = isArray ? [...valueIsArrayNum ? value.replace(' ', '').split(',').map(v => parseFloat(v)) : [parseFloat(value)]] : valueIsNum ? parseFloat(value) : parseFloat(value.replace(' ', '').split(',')[0])
            } else if ((typeof opt.val == "string" || typeof opt.val[0] == "string")) {
                opt.val = isArray ? [...value.split(',')] : value
            } else {
                return { flag: 'r', message: `Invalid type for key '${key}'` }
            }
            continue;
        }
        let prev = configHolder[i-1]
        opt.val[prev.key] = prev.val
    }
    let saver = configHolder[ configHolder.length - 1 ]
    guild_config[saver.key] = saver.val 
    guild_config.save()
    // if ()
    // configHolder[configHolder.length -1].val =

    return { flag: 'n' }
}

module.exports = _

export = _
