import voice = require("@discordjs/voice")
// import discord = require("discord.js")
import queue_data = require("./queues")
import ytsearch = require("@distube/ytsr")
import ytdl = require("@distube/ytdl-core")
import ytpl = require("@distube/ytpl")
import dayjs = require("dayjs")

let _ = {
    interaction: (interaction) => {
        let search = interaction.options.getString("video_query", false)
        return run(interaction.member, interaction.guild.id, interaction.channel, search, search != null && search !== "" ? search.split(' ') : null)
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
    usage: "music play or music play <url> or music play <search>",
    get play_next() {
        return play_next
    }
} satisfies import("main/types").Command & {play_next: typeof play_next}

let play_next = async (text_channel: import("discord.js").GuildTextBasedChannel, guild_id: string, retrys = 0) => {
    let gqueue_info = queue_data.guild_queues[ guild_id ];
    if (gqueue_info.clearing) {
        gqueue_info.clearing = false
        let timeout_msg = await text_channel.send("No more music in the queue. I will leave in 5 minutes if music is not added.")
        let timeout = setTimeout(() => {
            end(guild_id)
            timeout_msg.edit("I disconnected due to inactivity")
        }, 5 * 60 * 1000) 
        gqueue_info.timeout_info = { timeout: timeout, msg: timeout_msg, type: "queue" }
        return
    }
    // console.log("playing next song")
    let next = gqueue_info.next
    let cur = gqueue_info.cur
    let loop = gqueue_info.loop
    let queue = gqueue_info.queue
    let err_handle = async (err) => {
        text_channel.send(`There was an error while trying to play this track ([${queue[cur].title}](${queue[cur].link}))`)
        gqueue_info.player.stop()
        // cur = next
        // next++
        if (!queue[next] || !(loop == 'song' && queue[cur])) {
            let timeout_msg = await text_channel.send("No more music in the queue. I will leave in 5 minutes if music is not added.")
            let timeout = setTimeout(() => {
                end(guild_id)
                timeout_msg.edit("I disconnected due to inactivity")
            }, 5 * 60 * 1000)
            gqueue_info.timeout_info = { timeout: timeout, msg: timeout_msg, type: "queue" }
        }
        play_next(text_channel, guild_id, loop == 'song' ? retrys + 1 : 0)
        console.error(err)
    }
    if (retrys > 2) {
        text_channel.send("Failed after 3 retries, skipping to next song")
        cur = next
        next++
        if (gqueue_info.loop == "song") {
            gqueue_info.loop = false;
        }
    }
    cur = gqueue_info.skipping ? next++ : gqueue_info.loop == "song" ? cur : next++;
    try {
        gqueue_info.player.play(voice.createAudioResource(ytdl(queue[ cur ].link, { liveBuffer: 25000, highWaterMark: 1024 * 1024 * 64, quality: "highestaudio", filter: "audioonly" }), { silencePaddingFrames: 10 }))
    } catch (err) {
        err_handle(err)
        return
    }
    gqueue_info.player.once("error", err_handle)
    gqueue_info.np_msg = {
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
            text: `Looping: Queue ${gqueue_info.loop === true ? "✅" : "❌"} Song ${gqueue_info.loop === "song" ? "✅" : "❌"}`
        }
    }
    let np_msg = await text_channel.send({ embeds: [ gqueue_info.np_msg ] })
    setTimeout(() => {
        np_msg.delete().catch(() => null)
    }, 5500)
    gqueue_info.cur = cur
    gqueue_info.next = next
    queue_data.guild_queues[ guild_id ] = gqueue_info
}

let end = async (guild_id: string) => {
    // console.log("Run")
    queue_data.end(guild_id, true)
}

let playerStateChange = (guild_id: string, text_channel: import('discord.js').GuildTextBasedChannel) => async (_: voice.AudioPlayerState, newS: voice.AudioPlayerState) => {
    switch (newS.status) {
        case voice.AudioPlayerStatus.Buffering:
        case voice.AudioPlayerStatus.Paused:
        case voice.AudioPlayerStatus.Playing: {
            return
        }
        case voice.AudioPlayerStatus.AutoPaused: {
            end(guild_id)
            return
        }
    }

    let gqueue_data = queue_data.guild_queues[guild_id]

    // Now has to be idle
    if (gqueue_data.skipping) {
        return
    }

    let channel = gqueue_data.tchannel ?? text_channel
    if (gqueue_data.queue[gqueue_data.next] || gqueue_data.loop == "song") {
        play_next(channel, guild_id)
        return
    } else if (gqueue_data.loop === true) {
        gqueue_data.next = 0
        play_next(channel, guild_id)
        return
    }
    let timeout_msg = await text_channel.send("No more music in the queue. I will leave in 5 minutes if music is not added.")

    queue_data.guild_queues[guild_id].timeout_info = { timeout: setTimeout(() => {
        end(guild_id)
        timeout_msg.edit("I disconnected due to inactivity")
    }, 5 * 60 * 1000), msg: timeout_msg, type: 'queue' }
}

let run = async (member: import('discord.js').GuildMember, guild_id: string, text_channel: import('discord.js').GuildTextBasedChannel, search: string, search_split: string[]): Promise<import('main/types').CommandResult> => {
    // let search = _search.join(' ')
    let voice_channel = member.voice.channel
    if (!voice_channel?.joinable) {
        return { flag: 'r', message: "You are not in a voice channel I can enter" }
    }

    queue_data.create(guild_id, voice_channel)

    let connection = queue_data.guild_queues[ guild_id ].connection
    let player = queue_data.guild_queues[ guild_id ].player
    let queue = queue_data.guild_queues[ guild_id ].queue
    if (!search_split || search_split?.length < 1) {
        require("./resume").run(guild_id, member.id, voice_channel)
        return { flag: 'n' }
    }

    if (connection.listenerCount("stateChange") < 1) {
        connection.on("stateChange", async (_, newS) => {
            if (newS.status == voice.VoiceConnectionStatus.Destroyed) {
                end(guild_id)
                return
            }
            console.log(queue_data.guild_queues[guild_id].vchannel.members)
            if (queue_data.guild_queues[guild_id].vchannel.members.filter(member => !member.user.bot).size < 1) {
                let timeout_msg = await text_channel.send("I will leave in a minute due to user inactivity")
                queue_data.guild_queues[guild_id].player.pause()

                queue_data.guild_queues[guild_id].timeout_info = { timeout: setTimeout(() => {
                    end(guild_id)
                    timeout_msg.edit("I disconnected due to inactivity")
                }, 5 * 60 * 1000), msg: timeout_msg, type: 'user' }
            }
        })
    }

    if (player.listenerCount("stateChange") < 1) {
        player.on("stateChange", playerStateChange(guild_id, text_channel))
    }

    queue_data.guild_queues[guild_id].queue = queue
    queue_data.guild_queues[guild_id].tchannel = text_channel
    if (queue_data.guild_queues[guild_id].timeout_info.timeout) {
        clearTimeout(queue_data.guild_queues[guild_id].timeout_info.timeout)
        queue_data.guild_queues[guild_id].timeout_info.timeout = undefined
    }
    queue_data.guild_queues[guild_id].timeout_info.type = "none"

    let url: URL
    try {
        url = new URL(search_split[ 0 ])
    } catch { }

    if (!url) {
        ytsearch(search, { type: "video", safeSearch: false, limit: 20 }).then(async result => {

            let ran = 0
            let selections = [ "1️⃣", "2️⃣", "3️⃣" ]
            let fields = []
            let options: { [ key: string ]: typeof queue[ 0 ] } = {}

            for (let video of result.items) {
                if (!video.isLive && !video.upcoming) {
                    fields.push({
                        inline: true,
                        name: `${selections[ ran ]}: `,
                        value: `[${video.name}](${video.url})\n[${video.author.name}](${video.author.url})`
                    })
                    options[ selections[ ran ] ] = {
                        duration: video.duration,
                        thumbnail: video.thumbnail,
                        // source: "Youtube",
                        uploader: {
                            name: video.author.name,
                            url: video.author.url
                        },
                        title: video.name,
                        link: video.url
                    }
                    ran++
                }
                if (ran == 2) {
                    break;
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
                    if (queue_data.guild_queues[ guild_id ].queue.length == 0) {
                        end(guild_id)
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
                    play_next(text_channel, guild_id)
                }
                
            } catch (err) {
                selmsg.delete().catch(() => null)
                text_channel.send("No response within 30 seconds, Cancelling")
                if (queue_data.guild_queues[ guild_id ].queue.length == 0) {
                    end(guild_id)
                }
            }
        })
        return
    }

    if (ytpl.validateID(search_split[0])) {
        let pl: ytpl.result
        try {
            pl = await ytpl(search_split[0], { limit: Infinity })
        } catch {
            if (queue_data.guild_queues[guild_id].queue.length == 0) {
                end(guild_id)
            }
            return { flag: "r", message: 'The playlist does not exist.' };
        }
        for (let video of pl.items) {
            queue.push({
                duration: video.duration,
                thumbnail: video.thumbnail,
                // source: "Youtube",
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
    } else if (ytdl.validateURL(search_split[0])) {
        let video = (await ytdl.getInfo(search_split[0])).videoDetails
        
        if (!video) {
            if (queue_data.guild_queues[guild_id].queue.length == 0) {
                end(guild_id)
            }
            return { flag: 's', message: 'Error getting video info' };
        }

        if (video.isLiveContent) {
            if (queue_data.guild_queues[guild_id].queue.length == 0) {
                end(guild_id)
            }
            return { message: "Not an available video or playlist (can't play live videos)", flag: 'r' };
        }

        let dur_secs = parseInt(video.lengthSeconds)
        queue.push({
            duration: `${(dur_secs / 60).toFixed(0)}:${(dur_secs % 60) < 10 ? 0 : ''}${dur_secs % 60}`,
            link: search_split[0],
            // source: "Youtube",
            thumbnail: video.thumbnails[0].url,
            title: video.title,
            uploader: {
                name: video.author.name,
                url: video.author.channel_url
            }
        })

        let addmsg = await text_channel.send({
            embeds: [{
                color: 3142847,
                title: video.title,
                url: video.video_url,
                description: `Song Added. Queue #${queue.length}`,
                timestamp: dayjs().toISOString(),
                thumbnail: {
                    url: video.thumbnails[0].url,
                    height: 80,
                    width: 80
                },
                author: {
                    name: video.author.name,
                    url: video.author.channel_url
                }
            }]
        })

        setTimeout(() => {
            addmsg.delete().catch(() => null)
        }, 3000)
    } else {
        if (queue_data.guild_queues[guild_id].queue.length == 0) {
            end(guild_id)
        }
        return { flag: "r", message: 'Invalid YT Url' };
    }

    if (player.state.status == voice.AudioPlayerStatus.Idle) {
        play_next(text_channel, guild_id)
    }

    return { flag: 'n' }
}

module.exports = _

export = _

// ;(async () => {console.log((await (ctx.guild.channels.fetch())).filter(channel => channel.isVoice() ? channel.joinable && channel.members.has(ctx.member.id) : false).first())})()
