/* eslint-disable no-unused-vars */
import voice = require("@discordjs/voice")
import discord = require("discord.js")
import { Model } from "sequelize"

export interface Config {
    Activities: discord.ActivityOptions[]
    AuthUrl: string
    BaseCurrencyName: string
    BotOwner: string
    BotToken: string
    ClientId: string
    ClientSecret: string
    CloseOnUsedPort: boolean
    DBFile: string
    DBHost: string
    DBName: string
    DBPassword: string
    DBPort: number
    DBType: string
    DBUser: string
    DBUseSSL: boolean
    DisabledPlugins: string[],
    HttpPort: number
    UseHttps: boolean
    RefreshDays: number
    ReverseProxy: string
    Status: discord.PresenceStatusData
    WebDomain: string
    WebSecret: string
}

interface CommandResultSend {
    flag: 'r' | 's'
    message: string | discord.MessagePayload | discord.MessageCreateOptions
}

interface CommandResultNone {
    flag: 'n',
    message?: undefined | null
}

export type CommandResult = CommandResultSend | CommandResultNone

export interface UserLogin extends Model {
    id: string
    access_token: string
    refresh_token: string
    scope: string
    /** usually "Bearer" */
    token_type: string
    expire_time: string
}

/**
 * **Snowflake**
 * 
 * Documentation from https://discord.com/developers/docs/reference#snowflakes
 * 
 * ---
 * 
 * Discord utilizes Twitter's {@link [snowflake](https://github.com/twitter/snowflake/tree/snowflake-2010)} format for uniquely identifiable descriptors (IDs).
 * These IDs are guaranteed to be unique across all of Discord except in some unique scenarios in which child objects share their parent's ID.
 * Because Snowflake IDs are up to 64 bits in size (e.g. a uint64) they are always returned as strings in the HTTP API to prevent integer overflows in some languages.
 * See {@link [Gateway ETF/JSON](https://discord.com/developers/docs/topics/gateway#etfjson)} for more information regarding Gateway encoding.
 * 
 */
export type snowflake = string

export interface UserGuild {
    id: snowflake
    name: string
    permission: GuildPermissions
    rawPermissions: string,
    hasBot: boolean
    icon: string
}

export interface GuildPermissions {
    create_instant_invite: boolean
    kick_members: boolean
    ban_members: boolean
    administrator: boolean
    manage_channels: boolean
    manage_guild: boolean
    add_reactions: boolean
    view_audit_log: boolean
    priority_speaker: boolean
    stream: boolean
    view_channel: boolean
    send_messages: boolean
    send_tts_messages: boolean
    manage_messages: boolean
    embed_links: boolean
    attach_files: boolean
    read_message_history: boolean
    mentions_everyone: boolean
    use_external_emojis: boolean
    view_guild_insights: boolean
    connect: boolean
    speak: boolean
    mute_members: boolean
    deafen_members: boolean
    move_members: boolean
    use_vad: boolean
    change_nickname: boolean
    manage_nicknames: boolean
    manage_roles: boolean
    manage_webhooks: boolean
    manage_emojis_and_stickers: boolean
    use_application_commands: boolean
    request_to_speak?: boolean
    manage_events: boolean
    manage_threads: boolean
    create_public_threads: boolean
    create_private_threads: boolean
    use_external_stickers: boolean
    send_messages_in_thread: boolean
    use_embedded_activites: boolean
    moderate_members: boolean
}

export interface GuildConfig extends Model {
    gid: string
    econ_managers: string[]
    config_managers: string[]
    xp: { [ user_id: string ]: number }
    money: { [ user_id: string ]: number }
    other: {[key: string]: any}
}

export interface GuildQueue {
    [ key: string ]: {
        connection: voice.VoiceConnection
        player: voice.AudioPlayer
        queue: {
            uploader: {
                url: string
                name: string
            }
            thumbnail: string
            title: string
            duration: string
            // source: string
            link: string
        }[]
        next: number
        cur: number
        channel_id: string
        timeout_info: { timeout: NodeJS.Timeout, msg: discord.Message<boolean>, type: "queue" | "user" | "none" }
        np_msg: import("discord-api-types/payloads").APIEmbed,
        skiping: boolean
        loop: boolean | "song"
        clearing: boolean
        vchannel: discord.VoiceBasedChannel
        tchannel: discord.GuildTextBasedChannel
        // adding: boolean
    }
}

export interface Command {
    // command: (ctx: typeof import("discord.js").Message.prototype, ...args: string[]) => CommandResult | Promise<CommandResult>
    description: string
    usage: string
    level?: string
    slash: discord.SlashCommandBuilder | discord.SlashCommandOptionsOnlyBuilder | discord.SlashCommandSubcommandsOnlyBuilder,
    interaction: (interaction: discord.ChatInputCommandInteraction<discord.CacheType>) => CommandResult | Promise<CommandResult>
}

/**
 *  Reacts {
 *      "914880758668202056": {
 *          role_id: "914925160287600660",
 *          emoji: "✅"
 *      }
 *  }
 */
export interface Reacts {
    [ menu_id: string ]: {
        [role_name: string]: string,
        // emoji: string
    }
}

export type event<K extends keyof discord.ClientEvents> = {
    name: K,
    function: (config: Config, client: discord.Client<true>, ...args: discord.ClientEvents[K]) => any
}

export type plugin = {
    name: string
    description: string
    run: (ctx: discord.Message, guild_config: GuildConfig) => any
}

export interface Validator {
    List: {
        [key: string]: {
            Key: string,
            CipherText: string,
            Nonce: string,
            Tag: string,
            ExpireDate: string
        }
    }
}

export interface EventList {
    menu: (interaction: import("discord.js").SelectMenuInteraction) => any
}
