import _r = require("../libs/random")
import fs = require("fs")
import discord = require('discord.js')
let random = new _r()
// random.singleNum(4) == random.signelNum(4) (chance)
// random.num(random.singleNum(peconfig.digits-2)+2, random.singleNum(peconfig.max-1)+1) (val)

let xpconfig: { digits: number, max: number }
if (!fs.existsSync("./xp.json")) {
    xpconfig = { digits: 3, max: 6 }
    fs.writeFileSync("./xp.json", JSON.stringify(xpconfig))
} else {
    xpconfig = JSON.parse(fs.readFileSync("./xp.json", { encoding: "utf-8" }))
}

// module.exports = plugin
let _: import("../types").plugin = {
    run: async (ctx: discord.Message, guild_config: import("../types").GuildConfig) => {
        let xp = guild_config.xp
        let current_xp = xp[ ctx.member.id ] || 0

        if (random.singleNum(3) == random.singleNum(6) && !ctx.content.startsWith(guild_config.prefix)) {
            let add_amt = random.num(random.singleNum(xpconfig.digits - 2) + 2, random.singleNum(xpconfig.max - 1) + 1)
            xp[ ctx.member.id ] = current_xp + add_amt
            guild_config.xp = xp
            try {
                await guild_config.save()
                let msg = await ctx.channel.send({
                    embeds: [ {
                        color: 2883328,
                        description: `xp: ${current_xp + add_amt}`
                    } ]
                })
                setTimeout(() => {
                    msg.delete().catch(() => null)
                }, 2500)
            } catch { }
        }
    },
    description: "Adds commands to manage experience",
    name: "xp",

}

export = _
