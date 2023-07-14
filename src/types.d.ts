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
    Cert: string
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
    DHParam: string
    Privkey: string
    HttpPort: number
    HttpsPort: number
    UseHttps: boolean
    Prefix: string
    RefreshDays: number
    ReverseProxy: string
    Status: discord.PresenceStatusData
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

export interface UserLogin {
    access_token: string
    expires_in: number
    refresh_token: string
    scope: string
    token_type: string
    expire_time: string
}

/**?string*/
export type email = `${string | number}@${string | number}.${string}`

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
export type snowflake = `${number}`

/**
 * **Role Object**
 * 
 * Documentation from https://discord.com/developers/docs/resources/user
 * 
 * ---
 * 
 * Users in Discord are generally considered the base entity.
 * Users can spawn across the entire platform be members of guilds participate in text and voice chat and much more.
 * Users are separated by a distinction of "bot" vs "normal."
 * Although they are similar bot users are automated users that are "owned" by another user.
 * Unlike normal users bot users do not have a limitation on the number of Guilds they can be a part of.
 * 
 * */
export interface User {
    /**the user's id*/
    id: snowflake
    /**the user's username not unique across the platform*/
    username: string
    /**the user's 4-digit discord-tag*/
    discriminator: string
    /**the user's {@link [avatar hash](https://discord.com/developers/docs/reference#image-formatting)}*/
    avatar: string
    /**whether the user belongs to an Oauth2 application*/
    bot?: boolean
    /**whether the user is an Official Discord System (part of the urgent message system)*/
    system?: boolean
    /**wheter the user has two factor enabled on their account*/
    mfa_enabled?: boolean
    /**the user's {@link [banner hash](https://discord.com/developers/docs/reference#image-formatting)}*/
    banner?: string
    /**the user's banner color encoded as an integer representation of hexadecimal color code*/
    accent_color?: number
    /*the user's chosen language option*/
    locale?: string
    /**whether the email on this account has been veriied*/
    verified?: boolean
    /**the user's email*/
    email?: email
    /**the {@link [flags](https://discord.com/developers/docs/resources/user#user-object-user-flags)} on a user's account*/
    flags?: number
    /**the {@link [type of Nitro subscription](https://discord.com/developers/docs/resources/user#user-object-premium-types)} on a user's account*/
    premium_type?: number
    /**the public {@link [flags](https://discord.com/developers/docs/resources/user#user-object-user-flags)} on a user's account*/
    public_flags?: number
}

/**
 * **User Object**
 * 
 * Documentation from https://discord.com/developers/docs/topics/permissions#role-object
 * 
 * ---
 * 
 * Roles represent a set of permissions attached to a group of users.
 * Roles have unique names colors and can be "pinned" to the side bar causing their members to be listed separately.
 * Roles are unique per guild and can have separate permission profiles for the global context (guild) and channel context.
 * The `@everyone` role has the same ID as the guild it belongs to.
 */
export interface Role {
    /**role id*/
    id: snowflake
    /**role name*/
    name: string
    /**integer representation of hexadecimal color code*/
    color: number
    /**if this role is pinned in the user listing*/
    hoist: boolean
    /**role {@link [icon hash](https://discord.com/developers/docs/reference#image-formatting)}*/
    icon?: string
    /**role unicode emoji*/
    unicode_emoji?: Emoji
    /**position of this role*/
    position: number
    /**permission bit set*/
    permission: string
    /**whether is role is managed by an integration*/
    managed: boolean
    /**whether this role is mentionable*/
    mentionable: boolean
    /**the tags this role has*/
    tags?: {
        /**the id of the bot this role belongs to*/
        bot_id: snowflake
        /**the id of the integration this role belongs to*/
        integration_id: snowflake
        /**whether this is the guild's premium subscriber role*/
        premium_subscriber: null
    }
}

/**
 * **Emoji Object**
 * 
 * Documentation from https://discord.com/developers/docs/resources/emoji#emoji-object
 * 
 * ---
 * 
 * Routes for controlling emojis do not follow the normal rate limit conventions.
 * These routes are specifically limited on a per-guild basis to prevent abuse.
 * This means that the quota returned by our APIs may be inaccurate and you may encounter 429s.
*/
export interface Emoji {
    /**{@link [emoji_id](https://discord.com/developers/docs/reference#image-formatting)}*/
    id: snowflake
    /**emoji name (can be null only in reaction emoji objects)*/
    name: string | null
    /**roles allowed to use this emoji*/
    roles?: snowflake[]
    /**user that created this emoji*/
    user?: User
    /**whether this emoji music be wrapped in colons*/
    require_colons?: boolean
    /**whether this emoji is managed*/
    managed?: boolean
    /**whether this emoji is animated*/
    animated: boolean
    /**whether this emoji can be used may be false due to loss of Server Boosts*/
    available: boolean
}

type GuildFeaturesList = 'ANIMATED_ICON' | 'BANNER' | 'COMMERCE' | 'COMMUNITY' | 'DISCOVERABLE' | 'FEATURABLE' | 'INVITE_SPLASH' | 'MEMBER_VERIFICATION_GATE_ENABLED' | 'MONETIZATION_ENABLED' | 'MORE_STICKERS' | 'NEWS' | 'PARTNERED' | 'PREVIEW_ENABLED' | 'PRIVATE_THREADS' | 'ROLE_ICONS' | 'SEVEN_DAY_THREAD_ARCHIVE' | 'THREE_DAY_THREAD_ARCHIVE' | 'TICKETED_EVENTS_ENABLED' | 'VANITY_URL' | 'VERIFIED' | 'VIP_REGIONS' | 'WELCOME_SCREEN_ENABLED'

export interface UserGuild {
    id: snowflake
    name: string
    permission: GuildPermissions
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

/**
 * **Voice State Object**
 * 
 * Documentation from https://discord.com/developers/docs/resources/voice#voice-state-object
 * 
 * ---
 * 
 * Used to represent a user's voice connection status
 * 
 * ---
 * 
 * (Not Complete)
 */
export interface VoiceStateObject {
    /**the guild id this voice state is for*/
    guild_id?: snowflake
    /**the channel id this user is connected to*/
    channel_id: snowflake
    /**the user id this voice state is for*/
    user_id: snowflake
    /** */
}

/**
 * **Guild Object**
 * 
 * Documentation from https://discord.com/developers/docs/resources/guild#guild-object
 * 
 * ---
 * 
 * Guilds in Discord represent an isolated collection of users and channels and are often referred to as "servers" in the UI.
 * 
 * ---
 * 
 * ***These fields are only sent within the {@link [GUILD_CREATE](https://discord.com/developers/docs/topics/gateway#guild-create)} event**
 * 
 * ****These fields are only sent when using the {@link [GET Current User Guilds](https://discord.com/developers/docs/resources/user#get-current-user-guilds)}**
 * 
 * ---
 * 
 * (Not Complete)
 */
export interface Guild {
    /**guild id*/
    id: snowflake
    /**guild name (2-100 characters excluding trailing and leading whitespaces)*/
    name: string
    /**{@link [icon hash](https://discord.com/developers/docs/reference#image-formatting)}*/
    icon: string
    /**{@link [icon hash](https://discord.com/developers/docs/reference#image-formatting)} returned when in the template object*/
    icon_hash?: string
    /**{@link [splash hash](https://discord.com/developers/docs/reference#image-formatting)}*/
    splash: string
    /**{@link [discovery splash hash](https://discord.com/developers/docs/reference#image-formatting)}; only present for guilds with the "DISCOVERABLE" feature*/
    discovery_splash: string
    /**true if {@link [the user](https://discord.com/developers/docs/resources/user#get-current-user-guilds)} is the owner of the guild \*\**/
    owner?: boolean
    /**id of owner*/
    owner_id: snowflake
    /**total permissions for {@link [the user](https://discord.com/developers/docs/resources/user#get-current-user-guilds)} in the guild (excludes overwrites)*/
    permissions?: string | number
    /**id of afk channel*/
    afk_channel_id: snowflake
    /**afk timeout in seconds*/
    afK_timeout: number
    /**true if the server widget is enabled*/
    widget_enabled?: boolean
    /**the channel id that the widget will generate an invite to or **`null`** if set to no invite*/
    widget_channel_id: snowflake
    /**{@link [verification level](https://discord.com/developers/docs/resources/guild#guild-object-verification-level)} required for the guild*/
    verification_level: 0 | 1 | 2 | 3 | 4
    /**default {@link [message notifications level](https://discord.com/developers/docs/resources/guild#guild-object-default-message-notification-level)}*/
    default_message_notifications: 0 | 1
    /**{@link [explicit content filter](https://discord.com/developers/docs/resources/guild#guild-object-explicit-content-filter-level)}*/
    explicit_content_filter: 0 | 1 | 2
    /**roles in the guild*/
    roles: Role[]
    /**custom guild emojis*/
    emojis: Emoji[]
    /**enabled guild features*/
    features: GuildFeaturesList[]
    /**required {@link [MFA level](https://discord.com/developers/docs/resources/guild#guild-object-mfa-level)} for thee guild*/
    mfa_level: 0 | 1
    /**application id of the guild creator if it is bot-created*/
    application_id: snowflake
    /**id of the channel wehre guild notices such as welcome messages and boost events are posted*/
    system_channel_id: snowflake
    /**{@link [system channel flags](https://discord.com/developers/docs/resources/guild#guild-object-system-channel-flags)}*/
    system_channel_flags: number
    /**the id of the channel where Community guilds can display rules and/or guidelines*/
    rules_channel_id: snowflake
    /**when this guild was joined at**/
    joined_at?: string
    /**true if this is considered a large guild**/
    large?: boolean
    /**true if this guild is unavailable due to an outage**/
    unavailable?: boolean
    /**total number of members in this guild**/
    member_count?: number
    /**states of members currently in voice channels; lacks the guild_id key**/
    voice_states
}

export interface GuildConfig extends Model {
    gid: string
    prefix: string
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
            source: string
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
        vchannel?: discord.VoiceBasedChannel
        tchannel?: discord.GuildTextBasedChannel
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

/* export interface CommandWithInteraction extends CommandBase {
    slash: any,
    interaction: (interaction: discord.ChatInputCommandInteraction<discord.CacheType>) => CommandResult | Promise<CommandResult>
    // onMenu?: () => any
}

export interface CommandWithoutInteraction extends CommandBase {
    slash?: null | undefined,
    interaction?: null | undefined
} */

/* interface SubPluginData {
    slash: any
    command: (interaction: discord.ChatInputCommandInteraction<discord.CacheType>, guild_config: Guild_Config) => any
} */

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
/* export interface Reacts {
    [ message_id: string ]: {
        role_id: string,
        emoji: string
    }
} */ 

// export type command = CommandWithInteraction | CommandWithoutInteraction

export type event<K extends keyof discord.ClientEvents> = {
    name: K,
    function: (config: Config, client: discord.Client<true>, ...args: discord.ClientEvents[K]) => any
}

export type plugin = {
    name: string
    description: string
    run: (ctx: discord.Message, guild_config: GuildConfig) => any
    // /** Only use for interactions */
    // subCommands?: {[name: string]: SubPluginData}
}

export interface Validator {
    [key: string]: {
        Key: string,
        CipherText: string,
        Nonce: string,
        Tag: string,
        ExpireDate: string
    }
}

export interface EventList {
    menu: (interaction: import("discord.js").SelectMenuInteraction) => any
}
