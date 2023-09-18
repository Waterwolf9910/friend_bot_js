process.env["YTDL_NO_UPDATE"] = "1"
if (!process.env.NODE_ENV) {process.env.NODE_ENV="production"}
import path = require("path")
import fs = require("fs")
fs.existsSync(path.resolve(__dirname, ".pnp.cjs")) ? require("./.pnp.cjs").setup() : require("../.pnp.cjs")
require("./setup")
// import _fetch = require("node-fetch")
// let fetch = _fetch.default
import _rl = require("readline")
let rl = _rl.createInterface({ input: process.stdin, output: process.stdout, prompt: "> " })
// if (!fs.existsSync(path.resolve("..", ".dev.json"))) {
//     process.env["NODE_ENV"] = "production"
// }
import dayjs = require("dayjs")
import _random = require("./libs/random")
import crypto = require("./libs/crypto")
import discord = require("discord.js")
import os = require("os")
import Logger = require("./libs/logger")
import webserver = require("./web/main")
// let querystring: typeof import("querystring") = require("querystring")

let random = new _random(512, 9)
let config: import("./types").Config
let db: typeof import("./libs/db")
let client: typeof discord.Client.prototype
let clientOpt: import("discord.js/typings/index").ClientOptions
let isDev = process.env.NODE_ENV == "development"

// let dummy_store = new sequelize_store({ db: null, checkExpirationInterval: -1, expiration: -1}) // to set type
let logger = new Logger()
console = { ...logger, error: (message, ...optionalParams) => {
    if (typeof message == "string") {
        if (message.includes("ytsr") || message.includes("*********************") || message.includes("reelPlayerHeaderRenderer")) {
            return
        }
        return logger.error(message, ...optionalParams)
    }
    return logger.error(message, ...optionalParams)
} }

async function main() {
    client = new discord.Client(clientOpt)
    let token: string = config.BotToken
    let client_secret = config.ClientSecret
    let secret = config.WebSecret
    let validatorPath = path.resolve(os.homedir(), `friend_bot-validator.${isDev ? "dev" : "json"}`)
    let validater: import("./types").Validator = fs.existsSync(validatorPath) ? JSON.parse(fs.readFileSync(validatorPath, { encoding: 'utf-8' })) : {List: {}}
     
    let setToken = async (refresh = false) => {
        if (refresh) {
            token = crypto.decrypt({ tag: validater.List.BotToken.Tag, ciphertext: token, iv: validater.List.BotToken.Nonce, key: validater.List.BotToken.Key })
        }  
        let encrypted_BT = crypto.encrypt(token, random.alphaNumSpecial(true, null, 1024))
        config.BotToken = encrypted_BT.ciphertext
        validater.List.BotToken = {
            CipherText: config.BotToken,
            ExpireDate: dayjs().add(config.RefreshDays, "days").toISOString(),
            Key: encrypted_BT.key,
            Nonce: encrypted_BT.iv,
            Tag: encrypted_BT.tag
        }
        fs.writeFileSync(validatorPath, JSON.stringify(validater))
        fs.writeFileSync(path.resolve("config.json"), JSON.stringify(config, null, 4))
    }
    
    let setClientSecret = async (refresh = false) => {
        if (refresh) {
            client_secret = crypto.decrypt({ tag: validater.List.BotSecret.Tag, ciphertext: client_secret, iv: validater.List.BotSecret.Nonce, key: validater.List.BotSecret.Key })
        }
        let encrypted_CS = crypto.encrypt(client_secret, random.alphaNumSpecial(true, null, 1024))
        config.ClientSecret = encrypted_CS.ciphertext
        validater.List.BotSecret = {
            CipherText: config.ClientSecret,
            ExpireDate: dayjs().add(config.RefreshDays, "days").toISOString(),
            Key: encrypted_CS.key,
            Nonce: encrypted_CS.iv,
            Tag: encrypted_CS.tag
        }
        fs.writeFileSync(validatorPath, JSON.stringify(validater))
        fs.writeFileSync(path.resolve("config.json"), JSON.stringify(config, null, 4))
    }

    let setSecret = async (refresh = false) => {
        if (refresh) {
            secret = crypto.decrypt({ tag: validater.List.WebSecret.Tag, ciphertext: secret, iv: validater.List.WebSecret.Nonce, key: validater.List.WebSecret.Key })
        }
        let encrypted_WS = crypto.encrypt(secret, random.alphaNumSpecial(true, null, 1024))
        config.WebSecret = encrypted_WS.ciphertext
        validater.List.BotSecret = {
            CipherText: config.WebSecret,
            ExpireDate: dayjs().add(config.RefreshDays, "days").toISOString(),
            Key: encrypted_WS.key,
            Nonce: encrypted_WS.iv,
            Tag: encrypted_WS.tag
        }
        fs.writeFileSync(validatorPath, JSON.stringify(validater))
        fs.writeFileSync(path.resolve("config.json"), JSON.stringify(config, null, 4))
    }

    if (validater.List.BotToken && validater.List.BotToken.CipherText == config.BotToken) {
        if (dayjs(validater.List.BotToken.ExpireDate).diff(dayjs(), "days") <= 0) {
            await setToken(true)
        } else {
            token = crypto.decrypt({ tag: validater.List.BotToken.Tag, ciphertext: config.BotToken, iv: validater.List.BotToken.Nonce, key: validater.List.BotToken.Key })
            // secret = crypto.decrypt({auth_tag: web_authTag, data: config.secret, iv: webIv, key: webKey})
        }
    } else {
        await setToken()
    }

    if (validater.List.BotSecret && validater.List.BotSecret.CipherText == config.ClientSecret) {
        if (dayjs(validater.List.BotSecret.ExpireDate).diff(dayjs(), "days") <= 0) {
            await setClientSecret(true)
        } else {
            client_secret = crypto.decrypt({ tag: validater.List.BotSecret.Tag, ciphertext: config.ClientSecret, iv: validater.List.BotSecret.Nonce, key: validater.List.BotSecret.Key })
            // secret = crypto.decrypt({auth_tag: web_authTag, data: config.secret, iv: webIv, key: webKey})
        }
    } else {
        await setClientSecret()
    }

    if (validater.List.WebSecret && validater.List.WebSecret.CipherText == config.ClientSecret) {
        if (dayjs(validater.List.WebSecret.ExpireDate).diff(dayjs(), "days") <= 0) {
            await setClientSecret(true)
        } else {
            client_secret = crypto.decrypt({ tag: validater.List.WebSecret.Tag, ciphertext: config.WebSecret, iv: validater.List.WebSecret.Nonce, key: validater.List.WebSecret.Key })
            // secret = crypto.decrypt({auth_tag: web_authTag, data: config.secret, iv: webIv, key: webKey})
        }
    } else {
        await setClientSecret()
    }

    // console.log(token, secret, client_secret)
    // process.exit()
    client.login(token)
    // require("./commands").setup()

    client.once('ready', (_c) => {
        require("./slash_setup").setup(token, config)
        for (let eventFile of fs.readdirSync(path.resolve(__dirname, "event_listeners")).filter(val => val.endsWith('.js'))) {
            let mod = require(`./event_listeners/${eventFile}`)
            if (mod.name == "ready") {
                mod.function(config, client, _c)
            }
            client.on(mod.name, (...args) => mod.function(config, client, ...args))
        }
    })
    
    rl.on("close", close)
    // rl.on("pause", close)
    // rl.on("SIGCONT", close)
    rl.on("SIGINT", close)
    rl.on("SIGTSTP", close)
    webserver.start(secret, client_secret, config)
}

let close = async (error_code: number) => {
    console.log("Closing")
    webserver.stop()
    await db.sequelize.sync()
    client?.destroy()
    await db.sequelize.close()
    process.exit(typeof error_code == "number" ? error_code : 0)
}
// let cache: { messages: [ { id: string, channel: string} ] }
// client.generateInvite({ scopes: [ "bot" ], permissions: [ "ADD_REACTIONS", "CHANGE_NICKNAME", "CONNECT", "KICK_MEMBERS", "MANAGE_CHANNELS", "MANAGE_ROLES", "MENTION_EVERYONE", "READ_MESSAGE_HISTORY", "SEND_MESSAGES", "SEND_MESSAGES_IN_THREADS", "SPEAK", "USE_APPLICATION_COMMANDS", "USE_PUBLIC_THREADS", "USE_VAD", "VIEW_CHANNEL"] })
if (require.main === module) {
    // cli.
    console.log("Starting")
    db = require("./libs/db")
    config = JSON.parse(fs.readFileSync(path.resolve("./config.json"), { encoding: 'utf-8' }))
    let run = () => {
        // cache = fs.existsSync(path.resolve("cache.json")) ? JSON.parse(fs.readFileSync(path.resolve("cache.json"), { encoding: "utf-8" })): {}
        clientOpt = {
            rest: {
                globalRequestsPerSecond: 40,

            },
            intents: [
                // discord.IntentsBitField.Flags.,
                discord.GatewayIntentBits.GuildMessages,
                discord.GatewayIntentBits.GuildPresences,
                discord.GatewayIntentBits.GuildMessageReactions,
                discord.GatewayIntentBits.DirectMessages,
                discord.GatewayIntentBits.GuildVoiceStates,
                discord.GatewayIntentBits.Guilds,
                discord.GatewayIntentBits.GuildWebhooks,
                discord.GatewayIntentBits.MessageContent,
                // "GuildMessages",
                // "MessageContent",
                // "GuildPresences",
                // "GuildMessageReactions",
                // "DirectMessages",
                // "GuildVoiceStates",
                // "Guilds"
            ],
            // ws: { compress: true },
            presence: {
                afk: true,
                activities: config.Activities,
                status: config.Status
            },
            partials: [ discord.Partials.Channel, discord.Partials.GuildMember, discord.Partials.Message, discord.Partials.Reaction, discord.Partials.User, discord.Partials.ThreadMember],
            failIfNotExists: false,
        }
        // console.log(config.activities)
        console.log("Staring Bot")
        main().catch((err) => {
            console.error("An error has occured in the main process. The program will now close.")
            console.fatal(err)
            // client.destroy()
            // if (err.type !== "__internal-no-catch__") {
            process.exit(-1)
            // }
        })
        // handlers()
    }

    // let handlers = async () => {
        // try {
            //TODO: Change to using database
            // Check reactions for react roles
        // } catch (err) {
            // console.log("An error has occured within a handler")
            // console.error(err)
            // process.exit()
            // setTimeout(() => {
            //     handlers()
            // }, 30000)
        // }
    // }

    let getToken = (input: string) => {
        if (input.length > 20) {
            config.BotToken = input
            rl.setPrompt("Enter Client Secret: ")
            rl.prompt()
            rl.once("line", getSecret)
        } else {
            rl.prompt()
            rl.once("line", getToken)
        }
    }
    let getSecret = (input: string) => {
        if (input.length > 10) {
            config.ClientSecret = input
            rl.setPrompt("Enter Client ID: ")
            rl.prompt()
            rl.once("line", getCID)
        } else {
            rl.prompt()
            rl.once("line", getSecret)
        }
    }
    let getCID = (input: string) => {
        if (input.length > 10) {
            config.ClientId = input
            rl.setPrompt("Enter Client ID: ")
            rl.prompt()
            run()
        } else {
            rl.prompt()
            rl.once("line", getCID)
        }
    }
    if (config.BotToken.length < 20) {
        rl.setPrompt("Enter Bot Token: ")
        rl.prompt()
        rl.once("line", getToken)
    } else if (config.ClientSecret.length < 10) {
        rl.once("line", getSecret)
    } else if (config.ClientId.length < 10) {
        rl.once("line", getCID)
    } else {
        run()
    }
}

