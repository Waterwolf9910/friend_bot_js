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
import https = require("https")
import http = require("http")
import Logger = require("./libs/logger")
import cookieParser = require("cookie-parser")
import session = require("express-session")
import _sequelize = require("sequelize")
import _sequelize_store = require("connect-session-sequelize")
let sequelize_store = _sequelize_store(session.Store)
import express = require("express")
import helmet = require("helmet")
import cors = require("cors")
import uuid = require("uuid")
import morgan = require("morgan")
import errorhandler = require("errorhandler")
import url = require("url")
import events = require("./events")
// let querystring: typeof import("querystring") = require("querystring")

let app = express()
let random = new _random(512, 9)
let config: import("./types").Config
let httpServer: http.Server
let httpsServer: https.Server
let db: typeof import("./libs/db")
let client: typeof discord.Client.prototype
let clientOpt: import("discord.js/typings/index").ClientOptions
let client_secret: string
let sequelize_session: typeof _sequelize.Sequelize.prototype
let secret: string
// let dummy_store = new sequelize_store({ db: null, checkExpirationInterval: -1, expiration: -1}) // to set type
let store_obj//: typeof dummy_store
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

app.disable('x-powered-by')

async function main() {
    client = new discord.Client(clientOpt)
    let token: string = config.BotToken
    client_secret = config.ClientSecret
    secret = config.WebSecret
    let validatorPath = path.resolve(os.homedir(), "friend_bot-validator.json")
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
    
    let setSecret = async (refresh = false) => {
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
            await setSecret(true)
        } else {
            client_secret = crypto.decrypt({ tag: validater.List.BotSecret.Tag, ciphertext: config.ClientSecret, iv: validater.List.BotSecret.Nonce, key: validater.List.BotSecret.Key })
            // secret = crypto.decrypt({auth_tag: web_authTag, data: config.secret, iv: webIv, key: webKey})
        }
    } else {
        await setSecret()
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
    // run_server()
}

let close = async (error_code: number) => {
    console.log("Closing")
    await db.sequelize.sync()
    client?.destroy()
    await store_obj?.sync()
    await store_obj?.stopExpiringSessions()
    if (config.UseHttps) {
        if (httpsServer?.listening) {httpsServer.close()}
    }
    if (httpServer?.listening) {httpServer.close()}
    await db.sequelize.close()
    await sequelize_session?.close()
    process.exit(typeof error_code == "number" ? error_code : 0)
}
let store
let run_server = async () => {
    let forge: typeof import("node-forge") = require("node-forge")
    let dhparam: typeof import("dhparam") = require("dhparam")
    sequelize_session = new _sequelize.Sequelize({ database: "Friend_Bot", username: "friend_bot", password: secret, dialect: "sqlite", logging: (a) => {
        fs.appendFileSync(path.resolve("web_data", "session.log"), `[Sequelize] session-store: ${a}`)
    }, pool: {acquire: 40000}, storage: "./web_data/session.db" })
    await sequelize_session.sync()
    store_obj = new sequelize_store({ db: sequelize_session, checkExpirationInterval: 1000 * 60 * 10, expiration: 1000 * 60 * 60 * 24 * 7 * 2, tableName: "sessions", })
    // let session_data = sequelize_session.model("Session")
    // sequelize_session.connectionManager.getConnection({type: "write"})
    
    app.use(session({
        secret: config.WebSecret,
        store: store_obj,
        rolling: true,
        name: "friend_bot-sessions_stored",
        cookie: {
            httpOnly: true,
            secure: config.UseHttps,
            maxAge: (1000 * 60 * 60 * 24 * 7 * 2) - (1000 * 60),
            sameSite: "lax",
            signed: config.UseHttps
        },
        resave: false,
        saveUninitialized: false,
        unset: "destroy"
    }))

    if (config.UseHttps) {
        if (!fs.existsSync(path.resolve(config.Privkey)) || !fs.existsSync(path.resolve(config.Cert))) {
            console.log("Missing private key or certificate, recreating...")
            let keys = forge.pki.rsa.generateKeyPair({bits: 4096, workers: 2})
            fs.writeFileSync(path.resolve(config.Privkey), forge.pki.privateKeyToPem(keys.privateKey))
            fs.writeFileSync(path.resolve(config.Privkey, "..", "pubkey.pem"), forge.pki.publicKeyToPem(keys.publicKey))
            console.log("Done generating keys, now creating cert")
            let cert = forge.pki.createCertificate()
            cert.publicKey = keys.publicKey
            let attrs: import("node-forge").pki.CertificateField[] = [
                {
                    name: "commonName",
                    value: "localhost"
                }, {
                    name: "organizationName",
                    value: "localhost"
                }
            ]
            cert.validity.notBefore = new Date()
            cert.validity.notAfter = new Date()
            cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1)
            cert.setSubject(attrs)
            cert.setIssuer(attrs)
            cert.setExtensions([
                {
                    name: "subjectAltName",
                    altNames: [
                        {
                            type: 2,
                            value: os.hostname()
                        },
                        {
                            type: 7,
                            value: "127.0.0.1"
                        }, 
                        {
                            type: 7,
                            value: "::1"
                        }
                    ]
                },
            ])
            cert.sign(keys.privateKey)
            fs.writeFileSync(path.resolve(config.Cert), forge.pki.certificateToPem(cert))
            console.log("Cert successfully created")
            if (!fs.existsSync(path.resolve(config.DHParam))) {
                console.log("Missing dhparam, recreating... (this might take awhile)")
                fs.writeFileSync(path.resolve(config.DHParam), dhparam(4096))
            }
        }

        httpsServer = https.createServer({
            cert: fs.readFileSync(path.resolve(config.Cert), { encoding: 'utf-8' }),
            dhparam: fs.readFileSync(path.resolve(config.DHParam), { encoding: 'utf-8' }),
            key: fs.readFileSync(path.resolve(config.Privkey), { encoding: 'utf-8' }),
            minVersion: "TLSv1.2",
            sessionIdContext: "friend_bot"
        }, app)

        httpsServer.on("listen", () => {
            console.log(`Listening on port ${config.HttpsPort}`)
        })
    }

    httpServer = http.createServer((req, res) => {
        if (!config.UseHttps) {
            return app(req, res)
        } else {
            res.writeHead(302, {
                Location: `${config.ReverseProxy != "" ? config.ReverseProxy : "/" }`
            })
        }
    })

    httpServer.on("listening", () => {
        console.log(`Listening on port ${config.HttpPort}`)
    })
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
            ws: { compress: true },
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
            rl.setPrompt("")
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

let parsePermissions = (permissions: number) => {
    let result: import("./types").GuildPermissions = {
        create_instant_invite: (permissions & 1 << 0) == 1 << 0,
        kick_members: (permissions & 1 << 1) == 1 << 1,
        ban_members: (permissions & 1 << 2) == 1 << 2,
        administrator: (permissions & 1 << 3) == 1 << 3,
        manage_channels: (permissions & 1 << 4) == 1 << 4,
        manage_guild: (permissions & 1 << 5) == 1 << 5,
        add_reactions: (permissions & 1 << 6) == 1 << 6,
        view_audit_log: (permissions & 1 << 7) == 1 << 7,
        priority_speaker: (permissions & 1 << 8) == 1 << 8,
        stream: (permissions & 1 << 9) == 1 << 9,
        view_channel: (permissions & 1 << 10) == 1 << 10,
        send_messages: (permissions & 1 << 11) == 1 << 11,
        send_tts_messages: (permissions & 1 << 12) == 1 << 12,
        manage_messages: (permissions & 1 << 13) == 1 << 13,
        embed_links: (permissions & 1 << 14) == 1 << 14,
        attach_files: (permissions & 1 << 15) == 1 << 15,
        read_message_history: (permissions & 1 << 16) == 1 << 16,
        mentions_everyone: (permissions & 1 << 17) == 1 << 17,
        use_external_emojis: (permissions & 1 << 18) == 1 << 18,
        view_guild_insights: (permissions & 1 << 19) == 1 << 19,
        connect: (permissions & 1 << 20) == 1 << 20,
        speak: (permissions & 1 << 21) == 1 << 21,
        mute_members: (permissions & 1 << 22) == 1 << 22,
        deafen_members: (permissions & 1 << 23) == 1 << 23,
        move_members: (permissions & 1 << 24) == 1 << 24,
        use_vad: (permissions & 1 << 25) == 1 << 25,
        change_nickname: (permissions & 1 << 26) == 1 << 26,
        manage_nicknames: (permissions & 1 << 27) == 1 << 27,
        manage_roles: (permissions & 1 << 28) == 1 << 28,
        manage_webhooks: (permissions & 1 << 29) == 1 << 29,
        manage_emojis_and_stickers: (permissions & 1 << 30) == 1 << 30,
        use_application_commands: (permissions & 1 << 31) == 1 << 31,
        request_to_speak: (permissions & 1 << 32) == 1 << 32,
        manage_events: (permissions & 1 << 33) == 1 << 33,
        manage_threads: (permissions & 1 << 34) == 1 << 34,
        create_public_threads: (permissions & 1 << 35) == 1 << 35,
        create_private_threads: (permissions & 1 << 36) == 1 << 36,
        use_external_stickers: (permissions & 1 << 37) == 1 << 37,
        send_messages_in_thread: (permissions & 1 << 38) == 1 << 38,
        use_embedded_activites: (permissions & 1 << 39) == 1 << 39,
        moderate_members: (permissions & 1 << 40) == 1 << 40

    }
    
    return result;
}

app.use(express.text({ type: "application/json", inflate: true }))
app.use(express.text({ type: "text/plain", inflate: true }))
app.use(
    //@ts-ignore
    helmet({
        hsts: false,
        contentSecurityPolicy: {
            useDefaults: true,
            directives: {
                "script-src": [ "'self'", "'unsafe-eval'" ]
            }
        },
        hidePoweredBy: true,
        noSniff: true
    }))
app.use(cors())
app.set("trust proxy", config.ReverseProxy !== "")
app.use(errorhandler({
    log: (err, str, req) => {
        fs.appendFileSync(path.resolve("web_data", "error.log"), `Error at ${req.url} (${req.method} request)\n${str}\n${err}`)
    }
}))
fs.mkdirSync("web_data", {recursive: true})
fs.writeFileSync(path.resolve("web_data", "access.log"), '', {encoding: 'utf-8'})
app.use(morgan("combined", { stream: fs.createWriteStream(path.resolve("web_data", "access.log")) }))
app.use(morgan("dev", {stream: fs.createWriteStream(path.resolve("web_data", "debug_access.log"))}))
app.use(express.urlencoded({ extended: true, inflate: true }))
app.use(cookieParser(config.WebSecret))

let apiResonse = (success: boolean, message: string, data?: object | Array<any>) => {
    return JSON.stringify({ success: success, message: message, data: data })
}

app.post("/test", (req, res) => {
    req.session[ "test" ] = true
    res.send(apiResonse(true, ""))
})

app.get("/", (_req, res) => {
    res.redirect("/friend_bot")
})

app.get([ "/themes/get", "/themes" ], (_req, res) => {
    if (!fs.existsSync(path.resolve("web_data", "themes.json"))) {
        fs.writeFileSync(path.resolve("web_data", "themes.json"), JSON.stringify({ list: [ { dark: { internal: true } }, { light: { internal: true } } ] }))
    }
    let list = JSON.parse(fs.readFileSync(path.resolve("web_data", "themes.json"), { encoding: "utf-8" })).list
    res.send(apiResonse(true, "Themes", list))
})

app.post("/themes/set", (_req, res) => {
    res.send(apiResonse(false, "Not Implemented"))
})

// Create endpoint to get User info
app.get("/user", (req, res) => {
    if (req.session[ "user" ]) {
        res.send(apiResonse(true, "Signed In", { user: req.session[ "user" ] }))
    } else {
        res.send(apiResonse(false, "Not Signed in"))
    }
})

// Create Login Flow
app.get(config.AuthUrl, async (req, res, next) => {
    if (fs.existsSync(path.resolve("..", "data.json"))) {
        if (req.ip.includes("127.0.0.1") || req.ip.includes("::") || req.ip.includes("::ffff")) {
            let user_data: import("./types").UserLogin = JSON.parse(fs.readFileSync(path.resolve("..", "data.json"), { encoding: 'utf-8' }))
            if (dayjs(user_data.expire_time).toDate().getTime() >= dayjs().toDate().getTime()) {
                // Implement Refresh Token
                let data: { access_token: string, expires_in: number, refresh_token: string, scope: string, token_type: string/* "Bearer" */ } = await (await fetch("https://discord.com/api/oauth2/token", {
                    method: "POST",
                    body: new url.URLSearchParams({
                        client_id: config.ClientId,
                        client_secret: client_secret,
                        grant_type: "refresh_token",
                        refresh_token: user_data.refresh_token
                    }),
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    }
                })).json()
                let expire = dayjs().add(data.expires_in - 24 * 60 * 60, "s").format()
                // fs.writeFileSync(path.resolve("..", "data.json"), JSON.stringify({ ...data, expire_time: expire }))
                user_data = { ...data, expire_time: expire }

            }
            req.session[ "user_data" ] = user_data
            let user: import("./types").User = (await (await fetch("https://discord.com/api/users/@me", {
                headers: {
                    authorization: `${user_data.token_type} ${user_data.access_token}`
                }
            })).json())

            console.log(user)

            req.session[ "user" ] = { name: `${user.username}#${user.discriminator}`, id: user.id }

            next()

            let guilds: import("./types").Guild[] = (await (await fetch("https://discord.com/api/users/@me/guilds", {
                headers: {
                    authorization: `${user_data.token_type} ${user_data.access_token}`
                }
            })).json())

            let guilds_obj: import("./types").UserGuild[] = []
            for (let guild of guilds) {
                //@ts-ignore
                let permissions: import("./types").GuildPermissions = parsePermissions(parseInt(guild.permissions))
                guilds_obj.push({ id: guild.id, name: guild.name, permission: permissions, icon: `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.webp` })
            }

            store.get(req.sessionID, (err, sess) => {
                if (!err) {
                    sess[ "user" ].guilds = guilds_obj
                    store.set(req.sessionID, sess)
                }
            })
            return;
        }
    }
    let login: { state: string, iv: string, key: string, auth_tag: string } = req.session[ "login" ]
    if (login && req.query.code) {
        console.log(req.query, login)
        let loginState: string
        try {
            //@ts-ignore
            loginState = crypto.decrypt({ auth_tag: login.auth_tag, data: req.query.state.replaceAll(" ", "+"), iv: login.iv, key: login.key })
        } catch (err) {
            res.status(500).send('<p>You might have been <a href="https://en.wikipedia.org/wiki/Clickjacking">clickjacked</a>. Try logining in at another time or try one of <a href="https://en.wikipedia.org/wiki/Clickjacking#Prevention">these</a> options.</p>')
            console.log(err, req.query.state)
            return;
        }
        console.log(1, loginState, login)
        if (login.state == loginState) {
            try {
                let redirect_uri = new url.URLSearchParams(config.AuthUrl.replace(/[A-z0-9:/]+\?/, "?")).get("redirect_uri")//querystring.parse(config.auth_url.replace("https://discord.com/api/oauth2/authorize?", "")).redirect_uri
                let expire = dayjs()
                let user_data: { access_token: string, expires_in: number, refresh_token: string, scope: string, token_type: string/* "Bearer" */ } = await (await fetch("https://discord.com/api/oauth2/token", {
                    method: "POST",
                    body: new url.URLSearchParams({
                        client_id: config.ClientId,
                        client_secret: client_secret,
                        code: req.query.code.toString(),
                        grant_type: "authorization_code",
                        redirect_uri: redirect_uri,
                        scope: "identity guild"
                    }),
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    }
                })).json()
                // console.log(config.client_id, config.client_secret)
                expire.add(user_data.expires_in - 30, "s")
                // fs.writeFileSync(path.resolve("..", "data.json"), JSON.stringify({ ...user_data, expire_time: expire.format() }))

                req.session[ "user_data" ] = user_data
                let user: import("./types").User = (await (await fetch("https://discord.com/api/users/@me", {
                    headers: {
                        authorization: `${user_data.token_type} ${user_data.access_token}`
                    }
                })).json())

                console.log(user)

                req.session[ "user" ] = { name: `${user.username}#${user.discriminator}`, id: user.id }

                let id = uuid.v1({
                    msecs: dayjs().subtract(109, "milliseconds").toDate(),
                    nsecs: random.num(random.singleNum(4, 0), 9)
                })
                res.cookie("this_id", id, {
                    expires: dayjs().add(2, "weeks").subtract(5, "minutes").toDate(),
                    sameSite: "lax",
                    secure: config.UseHttps,
                    signed: config.UseHttps,
                })
                let _temp = {}
                _temp[ id ] = req.sessionID
                fs.writeFileSync(path.resolve("web_data", "cookie_session.json"), JSON.stringify(_temp), { encoding: "utf-8" })
                next()

                let guilds: import("./types").Guild[] = (await (await fetch("https://discord.com/api/users/@me/guilds", {
                    headers: {
                        authorization: `${user_data.token_type} ${user_data.access_token}`
                    }
                })).json())

                let guilds_obj: import("./types").UserGuild[] = []
                for (let guild of guilds) {
                    console.log("Checking", guild.id, `(${guild.name})`, guild.owner)
                    //@ts-ignore
                    let permissions: import("./types").GuildPermissions = parsePermissions(parseInt(guild.permissions))
                    guilds_obj.push({ id: guild.id, name: guild.name, permission: permissions, icon: `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.webp` })
                }

                store.get(req.sessionID, (err, sess) => {
                    if (!err) {
                        sess[ "user" ].guilds = guilds_obj
                        store.set(req.sessionID, sess)
                    }
                })
                return;
                // res.send("<p>Sucess</p>")
            } catch (err) {
                console.error(err)
                res.send('<p>Login failed, please try again later.</p>')
            }
        } else {
            res.status(500).send('<p>You might have been <a href="https://en.wikipedia.org/wiki/Clickjacking">clickjacked</a>. Try logining in at another time or try one of <a href="https://en.wikipedia.org/wiki/Clickjacking#Prevention">these</a> options.</p>')
        }
    } else {
        // Check if we should even attempt recover
        if (fs.existsSync(path.resolve("web_data", "cookie_session.json"))) {
            let cookie_session = JSON.parse(fs.readFileSync(path.resolve("web_data", "cookie_session.json"), { encoding: 'utf-8' }))
            let id = config.UseHttps ? req.signedCookies[ "this_id" ] : req.cookies[ "this_id" ]
            // Check if the client has a valid cookie for session recovery
            store.get(cookie_session[ id ], (err, sess) => {
                if (err) {
                    res.status(500).send("<p>Login Unsucessful</p>")
                    console.error(err)
                } else {
                    // Check if session has a login to restore
                    if (sess[ "user" ]) {
                        // Recover the session
                        store.set(req.sessionID, sess, (err1) => {
                            if (err1) {
                                res.status(500).send("<p>Login Unsucessful</p>")
                                console.error(err1)
                            }
                            // else {
                            //     req.sessionID = oid.get("sid").toString()
                            //     req.session.reload((err2) => {
                            //         if (err2) {
                            //             console.error(err2)
                            //             res.status(500).send("<p>Login Unsucessful</p>")
                            //         } else {
                            //             next()
                            //         }
                            //     })
                            // }
                        })
                    } else {
                        res.redirect("/friend_bot/getLogin")
                        console.error("Session does not have a login:\n", sess)
                    }
                }
            })
        } else {
            res.status(500).send("<p>Login Unsucessful</p>")
        }
    }
    // next()
})

app.get([ "/guilds", "/guilds/get", "/guilds/refresh" ], async (req, res) => {
    let user: { name: string, id: string, guilds: import("./types").UserGuild[] }
    if (req.path.includes("refresh")) {
        if (req.session[ "user" ]) {
            let user_data = req.session[ "user_data" ]
            let guilds: import("./types").Guild[] = (await (await fetch("https://discord.com/api/users/@me/guilds", {
                headers: {
                    authorization: `${user_data.token_type} ${user_data.access_token}`
                }
            })).json())

            let guilds_obj: import("./types").UserGuild[] = []
            for (let guild of guilds) {
                //@ts-ignore
                let permissions: import("./types").GuildPermissions = parsePermissions(parseInt(guild.permissions))
                guilds_obj.push({ id: guild.id, name: guild.name, permission: permissions, icon: `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.webp` })
            }

            store.get(req.sessionID, (err, sess) => {
                if (!err) {
                    sess[ "user" ].guilds = guilds_obj
                    store.set(req.sessionID, sess)
                }
            })
            return;
        } else {
            res.send(apiResonse(false, "Not Signed In"))
        }
    } else if (req.session[ "user" ]) {
        res.send(apiResonse(true, "Success", user.guilds))
    } else {
        res.send(apiResonse(false, "Not Signed In"))
    }
})

app.get("/getLogin", (req, res) => {
    // Generate and encrypt a state to be sent
    let state = random.alphaNum(true, 25)
    let state_enc = crypto.encrypt(state, random.alphaNumSpecial(true, null, 256))
    // Attach the state to the session
    req.session[ "login" ] = { state: state, iv: state_enc.iv, key: state_enc.key, auth_tag: state_enc.tag }
    // Manually save the session because we are redirecting
    req.session.save((err) => {
        if (err) {
            console.log(err)
            res.redirect("/login")
        } else {
            res.status(200).redirect(config.AuthUrl.replace("response_type=token", "response_type=code") + `&state=${state_enc.ciphertext}`)
        }
    })
})
app.get("/logout", (req, res, next) => {
    // Not complete
    req.session.destroy((err) => {
        if (err) {
            console.error(err)
        }
        next()
    })
})
app.use("/", express.static(path.resolve(__dirname, "static"), { dotfiles: "ignore", extensions: [ "html" ] }))
try {
    // httpServer.listen(config.HttpPort)
} catch (err) {
    if (err.code == "EADDRINUSE" && config.CloseOnUsedPort) {
        console.fatal(`Port: ${config.HttpPort} is currently in use. Closing Program.`)
        close(err.errno)
    } else if (err.code == "EADDRINUSE") {
        console.fatal(`Port: ${config.HttpPort} is currently in use. `)
    } else {
        throw err
    }
}
try {
    // httpsServer.listen(config.HttpsPort)
} catch (err) {
    if (err.code == "EADDRINUSE" && config.CloseOnUsedPort) {
        console.fatal(`Port: ${config.HttpsPort} is currently in use. Closing Program.`)
        close(err.errno)
    } else if (err.code == "EADDRINUSE") {
        console.fatal(`Port: ${config.HttpsPort} is currently in use. `)
    } else {
        throw err
    }
}
// app.use((err, req, res, next) => {
//     if (err) {
//         console.log(err)
//         res.status(500).send("An error has occured within the application")
//     } else {
//         next()
//     }
// })

