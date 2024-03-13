interface BaseWSData {
    /**
     * The request id of the message
     */
    request_id: number
    /**
     * The Message Identifier
     */
    type: string
    /**
     * The Message Data
     */
    msg?: object
}

interface BaseRequest extends BaseWSData {
    type: 'request'
    msg: {
        type: string
    }
}

interface GenericError extends BaseWSData {
    type: 'err'
    msg: {
        err: string
    }
}

// Errors

export interface InvalidMessage extends GenericError {
    msg: {
        err: 'invalid_msg'
    }
}

export interface SignedOut extends GenericError {
    msg: {
        err: 'not_logged_in'
    }
}

export interface IncorrectCredentials extends GenericError {
    msg: {
        err: 'incorrect_auth'
    }
}

export interface Unknown extends GenericError {
    msg: {
        err: 'unknown_message'
    }
}

// Reponses
export interface Success extends BaseWSData {
    // Returns on commands that don't expect a reponse
    type: 'success',
    msg: {
        type: server['type']
    }
}

export interface User extends BaseWSData {
    type: 'user'
    msg: {
        id: string
        name: string
        avatar: string
        guilds: { [key: string]: import('./src/types').UserGuild }
    }
}

export interface VoiceWithBot extends BaseWSData {
    type: "voice"
    msg: {
        id: string
        in_channel: boolean
        bot_in_channel: true
    }
}

export interface VoiceWOBot extends BaseWSData {
    type: "voice"
    msg: {
        bot_in_channel: false
    }
}

export interface ApplicationInfo extends BaseWSData {
    type: "app_info",
    msg: {
        client_id: string,
        
    }
}

export interface MusicQueue extends BaseWSData {
    type: "mqueue",
    msg: {
        queue: import("./src/types").GuildQueue[0]["queue"]
        cur: import("./src/types").GuildQueue[0]["cur"]
        next: import("./src/types").GuildQueue[0]["next"]
        loop: import("./src/types").GuildQueue[0]["loop"]
    }
}

export interface SearchResult extends BaseWSData {
    type: "search"
    msg: {
        video_result: import("@distube/ytsr").Video[]
    }
}

export interface RefreshGuilds extends BaseWSData {
    type: 'guild_refresh'
}

export interface SetSelectedID extends BaseWSData {
    type: "set_gid"
    msg: {
        gid: string
    }
}

export interface SendQueue extends BaseWSData {
    type: "smqueue",
    msg: Omit<MusicQueue["msg"], "cur"> & {guild_id: string, skipping: boolean}
}

export interface SendBotConfig extends BaseWSData {
    type: "bot_config",
    msg: import('./src/types').Config
}

export interface SendGuildConfig extends BaseWSData {
    type: "guild_config",
    msg: import('./src/types').GuildConfig
}

export interface SendBotConfig extends BaseWSData {
    type: 'bot_config',
    msg: import('./src/types').Config
}

// Requests
export interface UserRequest extends BaseRequest {
    msg: {
        type: 'user'
    }
}

export interface VoiceRequest extends BaseRequest {
    msg: {
        type: 'voice'
        guild_id: string
    }
}

export interface ApplicationRequest extends BaseRequest {
    msg: {
        type: "app_info"
    }
}

export interface MQueueRequest extends BaseRequest {
    msg: {
        type: "mqueue",
        guild_id: string
    }
}

export interface SearchRequest extends BaseRequest {
    msg: {
        type: "search",
        query: string
    }
}

export interface BotConfigRequest extends BaseRequest {
    msg: {
        type: 'bot_config'
    }
}

export interface GuildConfigRequest extends BaseRequest {
    msg: {
        type: "guild_config"
    }
}

export type Request = UserRequest | ApplicationRequest | VoiceRequest | MQueueRequest | SearchRequest | BotConfigRequest | GuildConfigRequest

export type Errors = InvalidMessage | SignedOut | IncorrectCredentials | Unknown

/**
 * Move to the client
 */
export type client = Errors | Success | User | (VoiceWithBot | VoiceWOBot) | ApplicationInfo | MusicQueue | SearchResult | SendBotConfig | SendGuildConfig

/**
 * Move to the server
 */
export type server = Request | RefreshGuilds | SetSelectedID | SendQueue | SendBotConfig
