import fs = require("fs")
import path = require('path')

let md = "react_roles <subcommand>: adds commands to manage reaction roles"
let cd = "create or add <'new' or role id> <'a message' or message id>: creates a react role message [perm level: admin]"
let vd = "view or list: shows reaction roles for server [perm level: admin]"
let rd = "remove or delete <message id>: removes reaction role for message id [perm level: admin]"
let defaultHelp = () => {
    return `${md}\n    ${cd}\n    ${vd}\n    ${rd}\nCreated by an internal plugin`
}

let plugin = async (ctx: import("discord.js").Message, guild_config: import("../../src/types").Guild_Config) => {
    
    // console.log(ctx.client.listenerCount("messageReactionAdd"))
    let _ = ctx.content.split(' ')
    // console.log(ctx)
    ctx.client.emojis.cache.values()
    // console.log(_)
    let args = _.slice(2)
    let create = async (role_id: string, message: string[] | string): Promise<string> => {
        if (!role_id) {
            return "Error: 'new', a role or role id was not given"
        }
        // if (!emoji) { return "Error: A reaction emoji was not given." }
        if (!message) {
            return "Error: A message or message id was not given"
        }
        if (role_id && message) { // For some reason the below kept getting fired after failing the above checks
            try {
                await ctx.guild.emojis.fetch(null, { cache: true })
            } catch (err) {
                // console.error(err)
                return "Error: Unable to fetch server's emojis..."
            }
            let emoji: typeof import("discord.js").GuildEmoji.prototype | typeof import("discord.js").ReactionEmoji.prototype
            try {
                let e = (await (await ctx.channel.send("React to this message with the emoji you want to use")).awaitReactions({ filter: (a, b) => b.id == ctx.author.id, time: 30000, max: 1, errors: [ "time" ] })).first()
                emoji = e.emoji
                await e.message.delete()
            } catch (err) {
                // console.error(err)
                return "No answer after 30 seconds. aborting"
            }
            let rid: string
            if (role_id.toLowerCase() != "new") {
                try {
                    await ctx.guild.roles.fetch(role_id, { cache: true })
                } catch (err) {
                    // console.error(err)
                    return "Error: Unable to fetch role..."
                }
                rid = ctx.guild.roles.cache.get(role_id)?.id
            } else {
                let create_role = async (name: string, color) => {
                    return (await ctx.guild.roles.create({ name: name, color: color, reason: "Requested by a admin/moderator" })).id
                }
                let msgname: typeof import("discord.js").Message.prototype
                let msgcolor: typeof import("discord.js").Message.prototype
                let _msg = await ctx.channel.send("What is the name of the new role?")
                try {
                    msgname = (await ctx.channel.awaitMessages({filter: (a) => a.author.id == ctx.author.id, max: 1, errors: ["time"], time: 30000})).first()
                    await msgname.delete()
                    await _msg.delete()
                } catch (err) {
                    await _msg.delete()
                    // console.log(err)
                    return "No answer after 30 seconds. aborting"
                }
                let validColor = false
                let _msg2 = await ctx.channel.send("What color for the role? (type list for instructions)")
                while (!validColor) {
                    try {
                        // ctx.channel.createMessageCollector() // Remember that this exists for access to canceling midway through
                        msgcolor = (await ctx.channel.awaitMessages({filter: (a) => a.author.id == ctx.author.id, max: 1, errors: ['time'], time: 30000})).first()
                        if (msgcolor.content == "list") {
                            let _m = await msgcolor.reply("Can use: DEFAULT, WHITE, AQUA, GREEN, BLUE, YELLOW, PURPLE, LUMINOUS_VIVID_PINK, FUCHSIA, GOLD, ORANGE, RED, GREY, DARKER_GREY, NAVY, DARK_AQUA, DARK_GREEN, DARK_BLUE, DARK_PURPLE, DARK_VIVID_PINK, DARK_GOLD, DARK_ORANGE, DARK_RED, DARK_GREY, LIGHT_GREY, DARK_NAVY, BLURPLE, GREYPLE, DARK_BUT_NOT_BLACK, NOT_QUITE_BLACK, RANDOM, a number, or a hex color (#fffff)")
                            await msgcolor.delete()
                            setTimeout(async () => {
                                await _m.delete()
                            }, 20000)
                        } else if (msgcolor.content.toLowerCase() == 'default' || msgcolor.content.toLowerCase() == 'white' || msgcolor.content.toLowerCase() == 'aqua' || msgcolor.content.toLowerCase() == 'green' || msgcolor.content.toLowerCase() == 'blue' || msgcolor.content.toLowerCase() == 'yellow' || msgcolor.content.toLowerCase() == 'purple' || msgcolor.content.toLowerCase() == 'luminous_vivid_pink' || msgcolor.content.toLowerCase() == 'fuchsia' || msgcolor.content.toLowerCase() == 'gold' || msgcolor.content.toLowerCase() == 'orange' || msgcolor.content.toLowerCase() == 'red' || msgcolor.content.toLowerCase() == 'grey' || msgcolor.content.toLowerCase() == 'darker_grey' || msgcolor.content.toLowerCase() == 'navy' || msgcolor.content.toLowerCase() == 'dark_aqua' || msgcolor.content.toLowerCase() == 'dark_green' || msgcolor.content.toLowerCase() == 'dark_blue' || msgcolor.content.toLowerCase() == 'dark_purple' || msgcolor.content.toLowerCase() == 'dark_vivid_pink' || msgcolor.content.toLowerCase() == 'dark_gold' || msgcolor.content.toLowerCase() == 'dark_orange' || msgcolor.content.toLowerCase() == 'dark_red' || msgcolor.content.toLowerCase() == 'dark_grey' || msgcolor.content.toLowerCase() == 'light_grey' || msgcolor.content.toLowerCase() == 'dark_navy' || msgcolor.content.toLowerCase() == 'blurple' || msgcolor.content.toLowerCase() == 'greyple' || msgcolor.content.toLowerCase() == 'dark_but_not_black' || msgcolor.content.toLowerCase() == 'not_quite_black' || msgcolor.content.toLowerCase() == 'random') {
                            rid = await create_role(msgname.content, msgcolor.content.toUpperCase())
                            await msgcolor.delete()
                            await _msg2.delete()
                            validColor = true
                            //@ts-ignore
                        } else if (!isNaN(msgcolor.content) || msgcolor.content.startsWith("#")) {
                            rid = await create_role(msgname.content, msgcolor.content)
                            await msgcolor.delete()
                            await _msg2.delete()
                            validColor = true
                        } else {
                            let _m = await msgcolor.reply(`${msgcolor.content} is not a valid color`)
                            await msgcolor.delete()
                            setTimeout(async () => {
                                await _m.delete()
                            }, 5000)
                        }
                    } catch (err) {
                        await _msg2.delete()
                        // console.error(err)
                        return "No answer after 30 seconds. aborting"
                    }
                }
            }
            if (!rid) { return "Failure in role resolution/creation"}
            let mid: string
            let created = false
            //@ts-ignore
            if (typeof message == "string" && !isNaN(message)) {
                try {
                    await ctx.channel.fetch()
                    let msg = (await ctx.channel.messages.fetch(message))
                    // let _d: typeof import("discord.js").Collection = require("discord.js").Collection
                    // new _d().concat()
                    await msg.react(emoji.name)
                    mid = msg.id
                } catch (err) {
                    // console.error(err)
                    return "Error: Unable to react to/fetch message from ID...\n Are you in the message's channel?"
                }
            } else {
                let msg = await ctx.channel.send(typeof message == "string" ? message : message.join(' '))
                msg.react(emoji.name)
                created = true
                mid = msg.id
            }
            if (!mid) { return "Failure in message resolution/creation\n _maybe try adding another word_"}

            let reacts: [ { message_id: string, role_id: string, emoji: string, guild_id: string, channel_id: string, created: boolean } ] = fs.existsSync("./reacts.json") ? JSON.parse(fs.readFileSync(path.resolve("./reacts.json"), { encoding: 'utf-8' })): []
            reacts.push({ message_id: mid, role_id: rid, emoji: emoji.name, guild_id: ctx.guild.id, channel_id: ctx.channel.id, created: created})
            fs.writeFileSync(path.resolve("./reacts.json"), JSON.stringify(reacts), { encoding: 'utf-8' })
            return "Success"
        }
    }
    let view = async () => {
        let reacts: [ { message_id: string, role_id: string, emoji: string, guild_id: string, channel_id: string, created: boolean } ] = fs.existsSync("./reacts.json") ? JSON.parse(fs.readFileSync(path.resolve("./reacts.json"), { encoding: 'utf-8' })) : []
        let new_react = []
        let returner: string
        if (reacts.length < 1) {
            // console.log("l")
            return "No Reactions have been created for this server"
        }
        let index = 1
        for (let i of reacts) {
            if (i.guild_id == ctx.guild.id) {
                try {
                    await ctx.guild.roles.fetch(i.role_id)
                    let _a = (await ctx.guild.channels.fetch(i.channel_id, {cache:true}))
                    if (_a.isTextBased() || _a.isThread()) {
                        await _a.messages.fetch(i.message_id)
                    }
                    await ctx.guild.emojis.fetch(null, {cache:true})
                } catch (err) {
                    // console.error(err)
                    continue;
                }
                let _b = ctx.guild.channels.cache.get(i.channel_id)
                let msg: string
                if (_b.isTextBased() || _b.isThread()) {
                    try {
                        msg = _b.messages.cache.get(i.message_id).content
                        msg = msg.split(" ").slice(0, 5).join(' ')
                    } catch {
                        continue
                    }
                } else {
                    continue
                }
                returner = `${index}. id: ${i.message_id}\n     message text: ${msg}${msg.length >= 4 ? "...\n" : "\n"}     emoji: ${i.emoji}\n     role name: ${ctx.guild.roles.cache.get(i.role_id).name}`
                index++
            } else {
                new_react.push(i)
            }
        }
        if (fs.existsSync(path.resolve("./reacts.json"))) {
            fs.writeFileSync(path.resolve("./reacts.json"), JSON.stringify(new_react))
        }
        return returner || "No Reactions have been created for this server"
    }
    let remove = async (message_id: string) => {
        let reacts: [ { message_id: string, role_id: string, emoji: string, guild_id: string, channel_id: string, created: boolean } ] = fs.existsSync("./reacts.json") ? JSON.parse(fs.readFileSync(path.resolve("./reacts.json"), { encoding: 'utf-8' })) : []
        let new_reacts: [ { message_id: string, role_id: string, emoji: string, guild_id: string, channel_id: string, created: boolean }? ] = []
        let guildHasReacts = false
        if (reacts.length < 1) {
            // console.log("l")
            return "No Reactions have been created for this server"
        }
        let found = false
        for (let i of reacts) {
            if (found) { guildHasReacts = true; break;}
            // console.log(i, reacts, ctx.guild.id)
            if (i.guild_id == ctx.guild.id) {
                guildHasReacts = true
                if (message_id != i.message_id) {
                    new_reacts.push(i)
                } else if (message_id == i.message_id && i.created) {
                    let _a: typeof import("discord.js").GuildChannel.prototype | typeof import("discord.js").ThreadChannel.prototype
                    try {
                        let _b = await ctx.guild.channels.fetch(i.channel_id)
                        if (_b.isTextBased() || _b.isThread()) {
                            await _b.messages.fetch(i.channel_id)
                        }
                    } catch (err) {
                        // found = true
                        return "Partial Success: cannot delete created message"
                    }
                    _a = ctx.guild.channels.cache.get(i.channel_id)
                    if (_a.isTextBased() || _a.isThread()) {
                        try {
                            await (await _a.messages.cache.get(i.message_id)).delete() 
                        } catch (err) {
                            // found = true
                            return "Partial Success: cannot delete created message"
                        }
                        // found = true
                        return "Success"
                    }
                }
            } else {
                new_reacts.push(i)
            }
        }
        if (!guildHasReacts) {
            // console.log('a')
            return "No Reactions have been created for this server"
        }
        if (!message_id) {
            // console.log(message_id)
            return `this command requires a message id\n${await view()}`
        }
        if (fs.existsSync(path.resolve("./reacts.json"))) {
            fs.writeFileSync(path.resolve("./reacts.json"), JSON.stringify(new_reacts))
        }
    }
    if (_[0].includes(`${guild_config.prefix}react_roles`)) {
        if (ctx.author.partial || ctx.member.partial) {
            try {
                await ctx.author.fetch()
                await ctx.member.fetch()
            } catch (err) {
                // console.error(err)
                ctx.channel.send("Unable to get author of message...")
                return;
            }
        }
        if (!ctx.member.permissions.has("ManageRoles")) {
            ctx.reply("You do not have permission to use this command!")
            return
        }
        if (!_[1]) {
            ctx.reply(`This command requires a subcommand\n${defaultHelp()}`)
            return;
        }
        switch (_[1]) {
            case "create": {
                let _a = args.slice(1)
                ctx.channel.send(await create(args[0], _a[1] ? _a : _a[0]))
                break;
            }
            case "add": {
                let _a = args.slice(1)
                ctx.channel.send(await create(args[ 0 ], _a[ 1 ] ? _a : _a[ 0 ]))
                break;
            }
            case "view": {
                ctx.channel.send(await view())
                break;
            }
            case "list": {
                ctx.channel.send(await view())
                break;
            }
            case "remove": {
                ctx.channel.send(await remove(args[ 0 ]))
                break;
            }
            case "delete": {
                ctx.channel.send(await remove(args[ 0 ]))
                break;
            }
            default: {
                ctx.reply(`${_[1]} is not a valid subcommand for react_roles`)
                break
            }
        }
    } else if (ctx.content.startsWith(`${guild_config.prefix}help react_roles`)) {
        switch (ctx.content.split(" ")[2]) {
            case "create": {
                ctx.channel.send(cd)
                break;
            }
            case "add": {
                ctx.channel.send(cd)
                break;
            }
            case "view": {
                ctx.channel.send(vd)
                break;
            }
            case "list": {
                ctx.channel.send(vd)
                break;
            }
            case "remove": {
                ctx.channel.send(rd)
                break;
            }
            case "delete": {
                ctx.channel.send(rd)
                break;
            }
            default: {
                if (ctx.content.split(" ")[2]) {
                    ctx.reply(`${ctx.content.split(" ")[2]} is not a valid subcommand`)
                } else {
                    ctx.channel.send(defaultHelp())
                }
                break
            }
        }
    } else if (ctx.content == `${guild_config.prefix}help` || ctx.content == `${guild_config.prefix}help`) {
        ctx.channel.send(defaultHelp())
    }
}

module.exports = plugin

export = plugin
