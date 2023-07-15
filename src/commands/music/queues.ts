import voice = require("@discordjs/voice")
let guild_queues: import("../../types").GuildQueue = {}

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
