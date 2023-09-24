interface BaseWSData {
    /**
     * The Message Identifier
     */
    type: string
    /**
     * The Message Data
     */
    msg: object
}

interface GenericError extends BaseWSData {
    type: 'err'
    msg: {
        err: string
    }
}

export interface User extends BaseWSData {
    type: 'user'
    msg: {
        id: string
        name: string
        avatar: string
        selected_gid: string
        guilds: { [key: string]: import('./src/types').UserGuild }
    }
}

export interface VoiceWithBot extends BaseWSData {
    type: "voice"
    msg: {
        id: string
        in_channel: boolean
        bot_in_channel: boolean
    }
}

export interface VoiceWOBot extends BaseWSData {
    type: "voice"
    msg: {
        bot_in_channel: boolean
    }
}

export interface ApplicationInfo extends BaseWSData {
    type: "app_info",
    msg: {
        client_id: string,
        
    }
}

export interface InvalidMessage extends GenericError {
    type: 'err'
    msg: {
        err: 'invalid_msg'
    }
}

export interface SignedOut extends GenericError {
    msg: {
        err: 'not_logged_in'
    }
}

export interface Unknown extends GenericError {
    msg: {
        err: 'unknown_message'
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

interface BaseRequest extends BaseWSData {
    type: 'request'
    msg: {
        type: 'user' | 'voice' | "app_info"
    }
}

export interface VoiceRequest extends BaseRequest {
    msg: {
        type: 'voice'
        guild_id: string
    }
}

export type Request = BaseRequest | VoiceRequest

/**
 * Move to the client
 */
export type client = User | (VoiceWithBot | VoiceWOBot) | ApplicationInfo | SignedOut | Unknown

/**
 * Move to the server
 */
export type server = Request | RefreshGuilds | SetSelectedID
