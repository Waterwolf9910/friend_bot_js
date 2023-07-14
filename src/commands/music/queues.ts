import voice = require("@discordjs/voice")
let guild_queues: import("../../types").GuildQueue = {}

/* setInterval(async () => {
    for (let i in guild_queues) {
        if (guild_queues[i]?.connection) {
            if (guild_queues[i].connection.state.status == voice.VoiceConnectionStatus.Destroyed) {
                guild_queues[ i ] = {
                    channel_id: undefined,
                    connection: undefined,
                    player: guild_queues[ i ]?.player,
                    cur: undefined,
                    next: undefined,
                    queue: undefined,
                    timeout: undefined,
                    np_msg: undefined,
                    skiping: false,
                    loop: false,
                    adding: false
                    // connected_vc: undefined
                }
            } else if (guild_queues[i].connection.state.status == voice.VoiceConnectionStatus.Disconnected) {
                guild_queues[i].connection.destroy()
                guild_queues[ i ] = {
                    channel_id: undefined,
                    connection: undefined,
                    player: guild_queues[ i ]?.player,
                    cur: undefined,
                    next: undefined,
                    queue: undefined,
                    timeout: undefined,
                    np_msg: undefined,
                    skiping: false,
                    loop: false,
                    adding: false
                    // connected_vc: undefined
                }
            }
        }
    }
}, 15000) */

setInterval(async () => {
    for (let guildId in guild_queues) {
        let data = guild_queues[guildId];
        if (data.vchannel) {
            // let channel = await data.vchannel.fetch(true)
            if (data.vchannel.members.size < 2 && data.timeout_info.type == "none") {
                guild_queues[guildId].player.pause()
                guild_queues[guildId].timeout_info.timeout = setTimeout(() => {
                    guild_queues[guildId].timeout_info.msg.edit("I have left due to no user activity").catch(() => null)
                    end(guildId, true)
                }, 60*1000)
                guild_queues[guildId].timeout_info.type = "user"
                guild_queues[guildId].timeout_info.msg = await data.tchannel?.send("I will leave in a minute due to user inactivity")
            } else if (data.timeout_info.type == "user") {
                for (let member of data.vchannel.members) {
                    if (!member[1].user.bot) {
                        clearTimeout(data.timeout_info.timeout)
                        break;
                    } 
                }
            }
        }
        // console.log(data.vchannel.guild.name)
        // data.vchannel.members.each(member => {
        //     console.log(member.displayName)
        // })
        // console.log("\n")
    }
},1000)

let create = (guild_id: string) => {
    let data = guild_queues[ guild_id ]
    guild_queues[ guild_id ] = {
        channel_id: data?.channel_id,
        connection: data?.connection,
        player: data?.player || voice.createAudioPlayer({ behaviors: { noSubscriber: voice.NoSubscriberBehavior.Stop }}),
        cur: data?.cur || 0,
        next: data?.next || 0,
        queue: data?.queue || [],
        timeout_info: data?.timeout_info || { timeout: undefined, msg: undefined, type: "none" },
        np_msg: data?.np_msg,
        skiping: data?.skiping || false,
        loop: data?.loop || false,
        tchannel: data?.tchannel || null,
        vchannel: data?.vchannel || null,
        clearing: false
        // adding: false
        // connected_vc: data?.connected_vc,
    }
}

let end = (guild_id: string, stop = false) => {
    let data = guild_queues[ guild_id ]
    if (!data) {
        return
    }
    if (stop) {
        try {
            data.player.removeAllListeners()
        } catch {}
        try {
            data.connection.destroy()
        } catch {}
        try {
            data.player.stop(true)
        } catch {}
        data.connection = undefined
        data.channel_id = undefined
        data.tchannel = undefined
        data.vchannel = undefined
    }
    guild_queues[ guild_id ] = {
        channel_id: data.channel_id,
        clearing: true,
        connection: data.connection,
        player: data.player,
        next: 0,
        cur: 0,
        queue: [],
        timeout_info: {
            msg: undefined,
            timeout: undefined,
            type: "none"
        },
        np_msg: undefined,
        skiping: false,
        loop: false,
        tchannel: data.tchannel,
        vchannel: data.vchannel
        // adding: false
        // connected_vc: undefined,
    }
}

export = {
    guild_queues,
    create,
    end
}
