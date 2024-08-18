// import Logger from "./libs/logger"
import session = require("express-session")
import express = require("express")
import expressWs = require("express-ws")

declare module "express-session" {
    interface SessionData {
        user_data: {
            id: string
            selected_gid: string
            name: string
            avatar: string
        }

        login: {
            state: string
            iv: string,
            key: string,
            auth_tag: string
        }

        guilds: { [ key: string ]: import('main/types').UserGuild }
    }
}

declare module "express" {
    interface Express extends express.Application {
        ws: expressWs.Application
    }
}
