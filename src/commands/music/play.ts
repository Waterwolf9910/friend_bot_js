import voice = require("@discordjs/voice")
// import discord = require("discord.js")
import queue_data = require("./queues")
import ytsearch = require("@distube/ytsr")
import ytdl = require("@distube/ytdl-core")
import ytpl = require("@distube/ytpl")
import dayjs = require("dayjs")

let _: import("../../types").Command= {
    // command: async (ctx, ..._search) => {
    //     return run(ctx.member, ctx.guild.id, (message) => {
    //        return ctx.reply(message)
    //        //@ts-ignore
    //     }, ctx.channel, _search.join((' ')), _search)
    // },
    interaction: (interaction) => {
        let search = interaction.options.getString("video_query", false)
        //@ts-ignore
        let member: import('discord.js').GuildMember = interaction.member
        return run(member, interaction.guild.id, interaction.channel, search, search != null && search !== "" ? search.split(' ') : null)
    },
    slash: require("./slash").addSubcommand(sub => {
        sub.setName("play")
        sub.setDescription("Add something to the play queue (use without arguments to resume)")
        sub.addStringOption(video_query => {
            video_query.setName("video_query")
            video_query.setDescription("text to search for or link of the video")
            video_query.setRequired(false)
            return video_query
        })
        return sub
    }),
    description: "Add something to the play queue (use without arguments to resume)",
    usage: "music play or music play <url> or music play <search>"
}

let join = (voice_channel: import("discord.js").VoiceBasedChannel, guildId: string) => {
    queue_data.guild_queues[ guildId ].connection = voice.joinVoiceChannel({
        channelId: voice_channel.id,
        guildId: voice_channel.guild.id,
        //@ts-ignore
        adapterCreator: voice_channel.guild.voiceAdapterCreator,
        selfDeaf: true,
        selfMute: false
    })
    queue_data.guild_queues[ guildId ].channel_id = voice_channel.id
}

let play_next = async (text_channel: import("discord.js").GuildTextBasedChannel, guildId: string, retrys = 0) => {
    let queueInfo = queue_data.guild_queues[ guildId ];
    if (queueInfo.clearing) {
        queueInfo.clearing = false
        let timeout_msg = await text_channel.send("No more music in the queue. I will leave in 5 minutes if music is not added.")
        let timeout = setTimeout(() => {
            end(guildId)
            timeout_msg.edit("I disconnected due to inactivity")
        }, 5 * 60 * 1000) 
        queueInfo.timeout_info = { timeout: timeout, msg: timeout_msg, type: "queue" }
        return
    }
    // console.log("playing next song")
    let next = queueInfo.next
    let cur = queueInfo.cur
    let loop = queueInfo.loop
    let queue = queueInfo.queue
    if (retrys > 2) {
        text_channel.send("Failed after 3 retries, skipping to next song")
        cur = next
        next++
    }
    cur = queueInfo.loop == "song" ? cur : next++;
    try {
        queueInfo.player.play(voice.createAudioResource(ytdl(queue[ cur ].link, { liveBuffer: 25000, highWaterMark: 1024 * 1024 * 64, quality: "highestaudio", filter: "audioonly" }), { silencePaddingFrames: 10 }))
    } catch (err) {
        text_channel.send(`There was an error while trying to play this track ([${queue[ cur ].title}](${queue[ cur ].link}))`)
        queueInfo.player.stop()
        // cur = next
        // next++
        if (!queue[ next ] || !(loop == 'song' && queue[ cur ])) {
            let timeout_msg = await text_channel.send("No more music in the queue. I will leave in 5 minutes if music is not added.")
            let timeout = setTimeout(() => {
                end(guildId)
                timeout_msg.edit("I disconnected due to inactivity")
            }, 5 * 60 * 1000)
            queueInfo.timeout_info = { timeout: timeout, msg: timeout_msg, type: "queue" }
        } 
        play_next(text_channel, guildId, loop == 'song' ? retrys + 1 : 0)
        console.error(err)
        return
    }
    queueInfo.np_msg = {
        color: 3142847,
        title: queue[ cur ].title,
        url: queue[ cur ].link,
        description: `Now Playing #${next}`,
        timestamp: dayjs().toISOString(),
        image: {
            url: queue[ cur ].thumbnail,
        },
        author: {
            name: queue[ cur ].uploader.name,
            url: queue[ cur ].uploader.url
        },
        footer: {
            text: `Looping: Queue ${queueInfo.loop === true ? "✅" : "❌"} Song ${queueInfo.loop === "song" ? "✅" : "❌"}`
        }
    }
    let np_msg = await text_channel.send({ embeds: [ queueInfo.np_msg ] })
    setTimeout(() => {
        np_msg.delete().catch(() => null)
    }, 5500)
    queueInfo.cur = cur
    queueInfo.next = next
    queue_data.guild_queues[ guildId ] = queueInfo
}

let end = async (guildId: string) => {
    // console.log("Run")
    queue_data.end(guildId, true)
}

let run = async (member: import('discord.js').GuildMember, guildId: string, text_channel: import('discord.js').GuildTextBasedChannel, search: string, searchSplit: string[]): Promise<import('../../types').CommandResult> => {
    // let search = _search.join(' ')
    let voice_channel = member.voice.channel
    if (!voice_channel?.joinable) {
        return { flag: 'r', message: "You are not in a voice channel I can enter" }
    }
    queue_data.create(guildId)
    // queue_data.guild_queues[ guildId ].adding = true

    let connection: voice.VoiceConnection
    let old_connection = queue_data.guild_queues[ guildId ].connection
    let player = queue_data.guild_queues[ guildId ].player
    let queue = queue_data.guild_queues[ guildId ].queue
    let timeout = queue_data.guild_queues[ guildId ].timeout_info.timeout
    clearTimeout(timeout)
    if (!searchSplit || searchSplit?.length < 1) {

        require("./resume").run(guildId, member.id, voice_channel)
        return { flag: 'n' }
        // let resp: import("../../types").CommandResult = await require("./resume").command(ctx)
        // if (resp.flag == "r") {
        //     reply(resp.message)
        // } else if (resp.flag == "s") {
        //     text_channel.send(resp.message)
        //     // ctx.react("✅")
        // }
        // return { flag: 'n', message: '' };
    }
    // Recreate the voice connection if stale or in a different channel
    if (old_connection) {
        if (old_connection.state.status == voice.VoiceConnectionStatus.Disconnected ||old_connection.state.status == voice.VoiceConnectionStatus.Destroyed) {
            join(voice_channel, guildId)
        } else if (queue_data.guild_queues[ guildId ].channel_id != voice_channel.id) {
            // Reconnect to new channel
            join(voice_channel, guildId)
        } else {
            connection = old_connection
        }
    } else {
        join(voice_channel, guildId)
    }
    connection = queue_data.guild_queues[ guildId ].connection
    connection.subscribe(player)

    let url: URL
    try {
        url = new URL(searchSplit[ 0 ])
    } catch { }
    if (url) {
        if (ytpl.validateID(url.searchParams.get("list"))) {
            let pl: ytpl.result
            try {
                pl = await ytpl(url.searchParams.get("list"), { limit: Infinity })
            } catch {
                if (queue_data.guild_queues[ guildId ].queue.length == 0) {
                    end(guildId)
                }
                return { flag: "r", message: 'The playlist does not exist.' };
            }
            for (let video of pl.items) {
                queue.push({
                    duration: video.duration,
                    thumbnail: video.thumbnail,
                    source: "Youtube",
                    uploader: {
                        name: video.author.name,
                        //@ts-ignore (supposed to be .url now)
                        url: video.author.url
                    },
                    title: video.title,
                    link: video.url
                })
            }
            let addmsg = await text_channel.send("Playlist Added")
            setTimeout(() => {
                addmsg.delete().catch(() => null)
            }, 3000)
            if (player.state.status == voice.AudioPlayerStatus.Idle) {
                play_next(text_channel, guildId)
            }
        } else if (ytdl.validateURL(searchSplit[ 0 ])) {
            let video = (await ytdl.getInfo(searchSplit[ 0 ])).videoDetails
            if (!video) {
                if (queue_data.guild_queues[ guildId ].queue.length == 0) {
                    end(guildId)
                }
                return { flag: 's', message: 'Error getting video info' };
            }
            if (!video.isLiveContent) {
                let durSecs = parseInt(video.lengthSeconds)
                queue.push({
                    duration: `${(durSecs / 60).toFixed(0)}:${(durSecs % 60) < 10 ? 0 : ''}${durSecs % 60}`,
                    link: searchSplit[ 0 ],
                    source: "Youtube",
                    thumbnail: video.thumbnails[ 0 ].url,
                    title: video.title,
                    uploader: {
                        name: video.author.name,
                        url: video.author.channel_url
                    }
                })
                let addmsg = await text_channel.send({
                    embeds: [ {
                        color: 3142847,
                        title: video.title,
                        url: video.video_url,
                        description: `Song Added. Queue #${queue.length}`,
                        timestamp: dayjs().toISOString(),
                        thumbnail: {
                            url: video.thumbnails[ 0 ].url,
                            height: 80,
                            width: 80
                        },
                        author: {
                            name: video.author.name,
                            url: video.author.channel_url
                        }
                    } ]
                })
                setTimeout(() => {
                    addmsg.delete().catch(() => null)
                }, 3000)
                if (player.state.status == voice.AudioPlayerStatus.Idle) {
                    play_next(text_channel, guildId)
                }
            } else {
                if (queue_data.guild_queues[ guildId ].queue.length == 0) {
                    end(guildId)
                }
                return { message: "Not an available video or playlist (can't play live videos)", flag: 'r' };
            }
        }
    } else {
        // if (!search || search?.length < 2) {
        //     return {flag: "r", message: "search query is too short"}
        // }
        ytsearch(search, { type: "video", safeSearch: false, limit: 3 }).then(async result => {

            let ran = 0
            let selections = [ "1️⃣", "2️⃣", "3️⃣" ]
            let fields = []
            //@ts-ignore
            let options: { [ key: string ]: typeof queue[ 0 ] } = {}

            for (let video of result.items) {
                if (video.type == "video" && !video.upcoming) {
                    fields.push({
                        inline: true,
                        name: `${selections[ ran ]}: `,
                        value: `[${video.name}](${video.url})\n[${video.author.name}](${video.author.url})`
                    })
                    options[ selections[ ran ] ] = {
                        duration: video.duration,
                        thumbnail: video.thumbnail,
                        source: "Youtube",
                        uploader: {
                            name: video.author.name,
                            url: video.author.url
                        },
                        title: video.name,
                        link: video.url
                    }
                    ran++
                }
            }
            let selmsg = await text_channel.send({
                embeds: [ {
                    title: `React with ${selections[ 0 ]}, ${selections[ 1 ]}, or ${selections[ 2 ]} to select the song`,
                    color: 3142847,
                    fields
                } ]
            })

            selmsg.react("1️⃣").then(_m1 => {
                selmsg.react("2️⃣").then(_m2 => {
                    selmsg.react("3️⃣").then(_m3 => {
                        selmsg.react("❌")
                    }).catch(() => null)
                }).catch(() => null)
            }).catch(() => null)
            try {
                let sel = (await selmsg.awaitReactions({ errors: [ "time" ], time: 30000, maxEmojis: 1, filter: (_react, user) => user.id == member.id })).first()
                selmsg.delete().catch(() => null)
                // console.log(sel.first().emoji, options)
                let video = options[ sel.emoji.name ]
                if (!video) {
                    let canmsg = await text_channel.send("Cancelled")
                    if (queue_data.guild_queues[ guildId ].queue.length == 0) {
                        end(guildId)
                    }
                    setTimeout(() => {
                        canmsg.delete().catch(() => null)
                    }, 3000)
                    return
                }
                queue.push(options[ sel.emoji.name ])
                let addmsg = await text_channel.send({
                    embeds: [ {
                        color: 3142847,
                        title: video.title,
                        url: video.link,
                        description: `Song Added. Queue #${queue.length}`,
                        timestamp: dayjs().toISOString(),
                        thumbnail: {
                            url: video.thumbnail,
                            height: 80,
                            width: 80
                        },
                        author: {
                            name: video.uploader.name,
                            url: video.uploader.url
                        }
                    } ]
                })
                setTimeout(() => {
                    addmsg.delete().catch(() => null)
                }, 3000)
                if (player.state.status == voice.AudioPlayerStatus.Idle) {
                    play_next(text_channel, guildId)
                }
                
            } catch (err) {
                selmsg.delete().catch(() => null)
                text_channel.send("No response within 30 seconds, Cancelling")
                if (queue_data.guild_queues[ guildId ].queue.length == 0) {
                    end(guildId)
                }
            }
        })
    }

    if (connection.listenerCount("stateChange") < 1) {
        connection.on("stateChange", async (_, newS) => {
            if (newS.status == voice.VoiceConnectionStatus.Destroyed || newS.status == voice.VoiceConnectionStatus.Disconnected) {
                end(guildId)
                return
            }
            if (queue_data.guild_queues[ guildId ].vchannel.members.filter(member => !member.user.bot).size < 1) {
                let timeout_msg = await text_channel.send("I will leave in a minute due to user inactivity")
                queue_data.guild_queues[ guildId ].player.pause()
                timeout = setTimeout(() => {
                    end(guildId)
                    timeout_msg.edit("I disconnected due to inactivity")
                }, 5 * 60 * 1000)
                queue_data.guild_queues[ guildId ].timeout_info = { timeout: timeout, msg: timeout_msg, type: 'queue' }
            }
        })
    }

    if (player.listenerCount("stateChange") < 1) {
        player.on("stateChange", async (_, newS) => {
            if (newS.status == voice.AudioPlayerStatus.Buffering) {
                return
            }
            if (newS.status == voice.AudioPlayerStatus.Paused) {
                return
            }
            if (newS.status == voice.AudioPlayerStatus.Playing) {
                return
            }
            if (newS.status == voice.AudioPlayerStatus.AutoPaused) {
                end(guildId)
                return
            }
            let queueData = queue_data.guild_queues[ guildId ]
            
            // Now has to be idle
            if (queueData.skiping) {
                return
            }

            // Handled in the listener above
            if (queueData.connection.state.status == voice.VoiceConnectionStatus.Destroyed || queueData.connection.state.status == voice.VoiceConnectionStatus.Disconnected) {
                return
            }

            let channel = queueData.tchannel ?? text_channel
            if (queueData.queue[ queueData.next ] || queueData.loop == "song") {
                play_next(channel, guildId)
            } else if (queueData.loop === true) {
                queueData.next = 0
                play_next(channel, guildId)
            } else {
                let timeout_msg = await text_channel.send("No more music in the queue. I will leave in 5 minutes if music is not added.")
                timeout = setTimeout(() => {
                    end(guildId)
                    timeout_msg.edit("I disconnected due to inactivity")
                }, 5 * 60 * 1000)
                queue_data.guild_queues[ guildId ].timeout_info = { timeout: timeout, msg: timeout_msg, type: 'queue' }
            }
        })
    }

    /* if (player.listenerCount(voice.AudioPlayerStatus.AutoPaused) < 1) {
        // console.log("adding autopause checker")
        player.addListener(voice.AudioPlayerStatus.AutoPaused, end)
    }
    if (player.listenerCount(voice.AudioPlayerStatus.Idle) < 1) {
        // console.log("added idle checker")
        player.addListener(voice.AudioPlayerStatus.Idle, async () => {
            // queue_data.guild_queues[ guildId ].connection.state
            let queueData = queue_data.guild_queues[ guildId ]
            if (queueData.skiping) {
                return
            }

            if (queueData.connection.state.status == voice.VoiceConnectionStatus.Destroyed || queueData.connection.state.status == voice.VoiceConnectionStatus.Disconnected) {
                end(guildId)
                return
            }

            // console.log("going to next track")
            if (queueData.queue[ queueData.next ]) {
                play_next(text_channel, guildId)
            } else if (queueData.loop === true) {
                queueData.next = 0
                play_next(text_channel, guildId)
            } else if (queueData.loop === "song") {
                play_next(text_channel, guildId)
            } else {
                let timeout_msg = await text_channel.send("No more music in the queue. I will leave in 5 minutes if music is not added.")
                timeout = setTimeout(() => {
                    end(guildId)
                    timeout_msg.edit("I disconnected due to inactivity")
                }, 5*60*1000)
                queue_data.guild_queues[ guildId ].timeout_info = { timeout: timeout, msg: timeout_msg, type: 'queue' }
            }
        })
    } */

    queue_data.guild_queues[ guildId ].connection = connection
    queue_data.guild_queues[ guildId ].player = player
    queue_data.guild_queues[ guildId ].queue = queue
    queue_data.guild_queues[ guildId ].vchannel = voice_channel
    queue_data.guild_queues[ guildId ].tchannel = text_channel
    // queue_data.guild_queues[ guildId ]
    if (queue_data.guild_queues[guildId].timeout_info.timeout) {
        clearTimeout(queue_data.guild_queues[ guildId ].timeout_info.timeout)
    }
    queue_data.guild_queues[ guildId ].timeout_info.type = "none"
    // console.log(queue_data[ guildId ])

    return { flag: 'n' }
}

module.exports = _

export = _

// ;(async () => {console.log((await (ctx.guild.channels.fetch())).filter(channel => channel.isVoice() ? channel.joinable && channel.members.has(ctx.member.id) : false).first())})()
