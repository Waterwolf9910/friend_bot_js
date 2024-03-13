process.env["YTDL_NO_UPDATE"] = "1"
if (!process.env.NODE_ENV) {process.env.NODE_ENV="production"}
import path = require("path")
import fs = require("fs")
fs.existsSync(path.resolve(__dirname, ".pnp.cjs")) ? require("./.pnp.cjs").setup() : require("../.pnp.cjs").setup()
import Logger = require("./libs/logger")
let logger = new Logger()
console = logger
import _rl = require("readline")
let rl = _rl.createInterface({ input: process.stdin, output: process.stdout, prompt: "> " })
import dayjs = require("dayjs")
import discord = require("discord.js")
import os = require("os")
import _random = require("./libs/random")
import crypto = require("./libs/crypto")
require("./setup")
import webserver = require("./web/main")
// let querystring: typeof import("querystring") = require("querystring")

let random = new _random(512, 9)
let config: import("./types").Config
let db: typeof import("./libs/db")
let client: discord.Client<true>
let isDev = process.env.NODE_ENV == "development"

/* console = { ...logger, error: (message, ...optionalParams) => {
    if (typeof message == "string") {
        if (message.includes("ytsr") || message.includes("*********************") || message.includes("reelPlayerHeaderRenderer")) {
            return
        }
        return logger.error(message, ...optionalParams)
    }
    return logger.error(message, ...optionalParams)
} } */

async function main() {
    let token: string = config.BotToken
    let client_secret = config.ClientSecret
    let secret = config.WebSecret
    let validatorPath = path.resolve(os.homedir(), `friend_bot-validator.${isDev ? "dev" : "json"}`)
    let validater: import("./types").Validator = fs.existsSync(validatorPath) ? JSON.parse(fs.readFileSync(validatorPath, { encoding: 'utf-8' })) : {List: {}}
     
    let setToken = async (refresh = false) => {
        if (refresh) {
            token = crypto.decrypt({ tag: validater.List.BotToken.Tag, ciphertext: token, iv: validater.List.BotToken.Nonce, key: validater.List.BotToken.Key })
        }
        console.log("Encrypted Token")
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
        console.log("Encrypted Client Secret")
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
        console.log("Encrypted Secret")
        let encrypted_WS = crypto.encrypt(secret, random.alphaNumSpecial(true, null, 1024))
        config.WebSecret = encrypted_WS.ciphertext
        validater.List.WebSecret = {
            CipherText: config.WebSecret,
            ExpireDate: dayjs().add(config.RefreshDays, "days").toISOString(),
            Key: encrypted_WS.key,
            Nonce: encrypted_WS.iv,
            Tag: encrypted_WS.tag
        }
        fs.writeFileSync(validatorPath, JSON.stringify(validater))
        fs.writeFileSync(path.resolve("config.json"), JSON.stringify(config, null, 4))
    }

    // Validate the bot token (maybe also go back to storing the tokens into os store)
    if (validater.List.BotToken && validater.List.BotToken.CipherText == config.BotToken) {
        if (dayjs(validater.List.BotToken.ExpireDate).diff(dayjs(), "days") <= 0) {
            await setToken(true)
        } else {
            token = crypto.decrypt({ tag: validater.List.BotToken.Tag, ciphertext: config.BotToken, iv: validater.List.BotToken.Nonce, key: validater.List.BotToken.Key })
        }
    } else {
        await setToken()
    }

    if (validater.List.BotSecret && validater.List.BotSecret.CipherText == config.ClientSecret) {
        if (dayjs(validater.List.BotSecret.ExpireDate).diff(dayjs(), "days") <= 0) {
            await setClientSecret(true)
        } else {
            client_secret = crypto.decrypt({ tag: validater.List.BotSecret.Tag, ciphertext: config.ClientSecret, iv: validater.List.BotSecret.Nonce, key: validater.List.BotSecret.Key })
        }
    } else {
        await setClientSecret()
    }

    if (validater.List.WebSecret && validater.List.WebSecret.CipherText == config.WebSecret) {
        if (dayjs(validater.List.WebSecret.ExpireDate).diff(dayjs(), "days") <= 0) {
            await setSecret(true)
        } else {
            secret = crypto.decrypt({ tag: validater.List.WebSecret.Tag, ciphertext: config.WebSecret, iv: validater.List.WebSecret.Nonce, key: validater.List.WebSecret.Key })
        }
    } else {
        await setSecret()
    }

    // Login to discord
    client.login(token)

    client.once('ready', (_c) => {
        require("./slash_setup").setup(token, config)
        // Get all modules in the event_listeners folder
        for (let eventFile of fs.readdirSync(path.resolve(__dirname, "event_listeners")).filter(val => val.endsWith('.js'))) {
            // Try to import the modules and add their events to the client
            try {
                let mod = require(`./event_listeners/${eventFile}`)
                if (mod.name == "ready") {
                    mod.function(config, client, _c)
                }
                client.on(mod.name, (...args) => mod.function(config, client, ...args))
            } catch {}
        }
        if (config.UseServer) {
            // Start the web server
            webserver.start(secret, client_secret, config, client)
        }
    })
    
    rl.on("close", close)
    // rl.on("pause", close)
    // rl.on("SIGCONT", close)
    rl.on("SIGINT", close)
    rl.on("SIGTSTP", close)
}

// Make sure everything is closed and saved
let close = async (error_code: number) => {
    console.log("Closing")
    webserver.stop()
    await db.sequelize.sync()
    client?.destroy()
    await db.sequelize.close()
    process.exit(typeof error_code == "number" ? error_code : 0)
}

if (require.main === module) {
    console.log("Starting")
    db = require("./libs/db")
    // Import the config
    config = JSON.parse(fs.readFileSync(path.resolve("./config.json"), { encoding: 'utf-8' }))
    client = new discord.Client({
        rest: {
            globalRequestsPerSecond: 40,
        },
        intents: [
            discord.GatewayIntentBits.GuildMessages,
            discord.GatewayIntentBits.GuildMessageReactions,
            discord.GatewayIntentBits.DirectMessages,
            discord.GatewayIntentBits.GuildVoiceStates,
            discord.GatewayIntentBits.Guilds,
            discord.GatewayIntentBits.GuildWebhooks,
            discord.GatewayIntentBits.MessageContent,
        ],
        // ws: { compress: true },
        presence: {
            afk: true,
            activities: config.Activities,
            status: config.Status
        },
        partials: [ discord.Partials.Channel, discord.Partials.GuildMember, discord.Partials.Message, discord.Partials.Reaction, discord.Partials.User, discord.Partials.ThreadMember ],
        failIfNotExists: false,
    })
    // client.generateInvite({
    //     scopes: [discord.OAuth2Scopes.Bot, discord.OAuth2Scopes.ApplicationsCommands],
    //     permissions: [
    //         discord.PermissionFlagsBits.AddReactions,
    //         discord.PermissionFlagsBits.AttachFiles,
    //         discord.PermissionFlagsBits.Connect,
    //         discord.PermissionFlagsBits.EmbedLinks,
    //         discord.PermissionFlagsBits.SendMessages,
    //         discord.PermissionFlagsBits.SendMessagesInThreads,
    //         discord.PermissionFlagsBits.Speak,
    //         discord.PermissionFlagsBits.UseExternalEmojis,
    //         discord.PermissionFlagsBits.UseExternalStickers,
    //         discord.PermissionFlagsBits.ViewChannel
    //     ]
    // })
    let run = () => {
        console.log("Staring Bot")

        main().catch((err) => { // "Unrecoverable Error"
            console.error("An error has occured in the main process. The program will now close.")
            console.fatal(err)
            try {
                client.destroy()
            } catch {}
            process.exit(-1)
        })
    }

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

