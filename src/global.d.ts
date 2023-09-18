// import Logger from "./libs/logger"
import session = require("express-session")
import ws = require("ws")

declare module "express-session" {
    interface SessionData {
        user_data: {
            id: string
            name: string
            avatar: string
        }
    }
}
