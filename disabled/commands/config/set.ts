import db = require("../../../src/libs/db")
import main = require("./index")
let _: import("../../../src/types").Command= {
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

let run = async (guild: import("discord.js").Guild, member: import('discord.js').GuildMember, key: string, value: string): Promise<import('../../../src/types').CommandResult> => {
    let [ guild_config ] = (await db.guild_configs.findOrCreate({ where: { id: guild.id } }))
    let manager = false
    let is_array: boolean

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

    let value_is_bool = (value == "true" || value == "false")
    let value_is_array_bool = ((value.includes("true") && value.includes(',')) || (value.includes("false") && value.includes(',')))
    //@ts-ignore
    let value_is_num = isNaN(value) && value != ""
    //@ts-ignore
    let value_is_array_num = (!isNaN(value.charAt(0)) && value.includes(',')) || (!isNaN(value.charAt(1)) && value.includes(','))
    let paths = key.split(".")
    let config_holder: {key: string, val: any}[] = []
    for (let path of paths) {
        let val = config_holder.length == 0 ? guild_config[ path ] : config_holder[ config_holder.length - 1 ].val[ path ]
        if (val == null) {
            return { flag: 'r', message: `Key '${key}' does not exist` }
        }
        config_holder.push({key: path, val })
    }
    config_holder.reverse()
    is_array = config_holder[0].val instanceof Array
    for (let i = 0; i < config_holder.length; i++) {
        let opt = config_holder[i]
        if (i == 0) {
            if ((typeof opt.val == "boolean" || typeof opt.val[0] == "boolean") && (value_is_bool || value_is_array_bool)) {
                opt.val = is_array ? [...value_is_array_bool ? value.replace(' ', '').split(",").map(v => v == "true") : [value == "true"]] : value_is_bool ? value == "true" : value.replace(' ', '').split(',')[0] == "true"
            } else if ((typeof opt.val == "number" || typeof opt.val[0] == "number") && (value_is_num || value_is_array_num)) {
                opt.val = is_array ? [...value_is_array_num ? value.replace(' ', '').split(',').map(v => parseFloat(v)) : [parseFloat(value)]] : value_is_num ? parseFloat(value) : parseFloat(value.replace(' ', '').split(',')[0])
            } else if ((typeof opt.val == "string" || typeof opt.val[0] == "string")) {
                opt.val = is_array ? [...value.split(',')] : value
            } else {
                return { flag: 'r', message: `Invalid type for key '${key}'` }
            }
            continue;
        }
        let prev = config_holder[i-1]
        opt.val[prev.key] = prev.val
    }
    let saver = config_holder[ config_holder.length - 1 ]
    guild_config[saver.key] = saver.val 
    guild_config.save()
    // if ()
    // configHolder[configHolder.length -1].val =

    return { flag: 'n' }
}

module.exports = _

export = _
