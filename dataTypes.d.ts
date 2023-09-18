interface BaseWSData {
    type: string,
    msg: object
}

export interface User extends BaseWSData {
    type: 'user'
    msg: {
        id: string
        name: string
        avatar: string
    }
}

/**
 * Move to the client
 */
export type client = User

/**
 * Move to the server
 */
export type server = undefined
