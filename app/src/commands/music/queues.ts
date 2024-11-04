import voice = require("@discordjs/voice")
let guild_queues: import("main/types").GuildQueue = {}

let create = (guild_id: string, vchannel: import("discord.js").VoiceBasedChannel, move = false) => {
    let data = guild_queues[ guild_id ]
    let conn_created = false
    let connection = data?.connection
    let player = data?.player

    player ??= voice.createAudioPlayer({ behaviors: { noSubscriber: voice.NoSubscriberBehavior.Stop } })
    
    if (!connection || connection.state.status == voice.VoiceConnectionStatus.Destroyed) {
        connection = voice.joinVoiceChannel({
            //@ts-ignore
            adapterCreator: vchannel.guild.voiceAdapterCreator,
            guildId: vchannel.guild.id,
            channelId: vchannel.id,
            selfDeaf: true,
            selfMute: false
        })
        conn_created = true;
    }

    if (move && !conn_created) {
        connection.rejoin({...connection.joinConfig, channelId: vchannel.id})
    }

    connection.subscribe(player)
    guild_queues[ guild_id ] = {
        connection,
        player,
        channel_id: vchannel.id,
        cur: data?.cur || 0,
        next: data?.next || 0,
        queue: data?.queue || [],
        timeout_info: data?.timeout_info || { timeout: undefined, msg: undefined, type: "none" },
        np_msg: data?.np_msg,
        skipping: data?.skipping || false,
        loop: data?.loop || false,
        tchannel: data?.tchannel || null,
        vchannel: move || !data?.vchannel ? vchannel : data.vchannel,
        clearing: false
        // adding: false
        // connected_vc: data?.connected_vc,
    }

    return guild_queues[guild_id]
}

let end = (guild_id: string, stop = false) => {
    let data = guild_queues[ guild_id ]
    if (!data) {
        return
    }
    if (stop) {
        // try {
        //     data.player.removeAllListeners()
        // } catch {}
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
        skipping: false,
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
