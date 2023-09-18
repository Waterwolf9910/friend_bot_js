import fs = require("fs")
import path = require("path")
import http = require("http")
import dayjs = require("dayjs")
// import cookieParser = require("cookie-parser")
import ews = require('express-ws')
import session = require("express-session")
import _sequelize = require("sequelize")
import _sequelize_store = require("connect-session-sequelize")
import express = require("express")
import helmet = require("helmet")
import cors = require("cors")
import uuid = require("uuid")
import morgan = require("morgan")
import errorhandler = require("errorhandler")
import compression = require("compression")
import url = require("url")
import crypto = require("../libs/crypto")
import _random = require("../libs/random")
import db = require("../libs/db")

let app = express()
let wsRouter = express.Router()
let server: http.Server
let sequelize_session: typeof _sequelize.Sequelize.prototype
let sequelize_store = _sequelize_store(session.Store)
let store_obj//: typeof dummy_store
let config: import("../types").Config
let isDev = process.env.NODE_ENV == "development"
let random = new _random(512, 9)
let client_secret: string

app.set('x-powered-by', false)


let parsePermissions = (permissions: number) => {
    let result: import("../types").GuildPermissions = {
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


let start = async (secret: string, _client_secret: string, _config: import("../types").Config) => {
    config = _config
    client_secret = _client_secret
    sequelize_session = new _sequelize.Sequelize({ database: "Friend_Bot", username: "friend_bot", password: secret, dialect: "sqlite", logging: (a) => {
        fs.appendFileSync(path.resolve("web_data", "session.log"), `[Sequelize] session-store: ${a}`)
    }, pool: {acquire: 40000}, storage: "./web_data/session.db" })
    await sequelize_session.sync()
    store_obj = new sequelize_store({ db: sequelize_session, checkExpirationInterval: 1000 * 60 * 10, expiration: 1000 * 60 * 60 * 24 * 7 * 2, tableName: "sessions", })

    app.set("trust proxy", config.ReverseProxy !== "" ? 0 : 1)

    app.use(session({
        secret: secret,
        store: store_obj,
        rolling: false,
        name: "sessionId",
        cookie: {
            httpOnly: true,
            secure: _config.UseHttps,
            maxAge: (1000 * 60 * 60 * 6) - (1000 * 60),
            sameSite: "strict",
            // sameSite: "lax",
            signed: _config.UseHttps
        },
        resave: false,
        saveUninitialized: false,
        unset: "destroy"
    }))

    server = http.createServer({}, app).listen(() => {
        console.log(`Listening on port ${_config.HttpPort}`)
    })
}

app.set("json spaces", 4)

app.use(express.text({ type: "application/json", inflate: true }))
app.use(express.text({ type: "text/plain", inflate: true }))
app.use(
    helmet.default({
        hsts: !isDev,
        contentSecurityPolicy: {
            useDefaults: true,
            directives: {
                "script-src": [ "'self'", isDev && "'unsafe-eval'" ].filter(v => typeof v != "boolean")
            }
        },
        hidePoweredBy: true,
        noSniff: true
    }))
app.use(cors())
app.use(errorhandler({
    
    log: (err, str, req) => {
        fs.appendFileSync(path.resolve("web_data", "error.log"), `Error at ${req.url} (${req.method} request)\n${str}\n${err}`)
    }
}))
fs.mkdirSync("web_data", { recursive: true })
fs.writeFileSync(path.resolve("web_data", "access.log"), '', { encoding: 'utf-8' })
app.use(express.urlencoded({ extended: true, inflate: true }))
if (!isDev) {
    app.use(morgan("combined", { stream: fs.createWriteStream(path.resolve("web_data", "access.log")) }))
    app.use(compression())
} else {
    app.use(morgan("dev", { stream: fs.createWriteStream(path.resolve("web_data", "debug_access.log")) }))
    let webpack: typeof import("webpack") = require("webpack")
    let wpdm: typeof import("webpack-dev-middleware") = require("webpack-dev-middleware")
    let wphm: typeof import("webpack-hot-middleware") = require("webpack-hot-middleware")
    let wpconfig: import("webpack").Configuration = require("../webpack.config")
    let compiler = webpack(wpconfig)
    // fs.watchFile("../webpack.config.js", {interval: 3000, persistent: true}, (d, n) => {
    //     if (d.size == n.size || d.size == 0 || n.size == 0) {
    //         return
    //     }
    //     console.log(d,n)
    //     delete(require.cache[require.resolve("../webpack.config")])
    //     compiler.options = require("../webpack.config")
    // })
    app.use(wpdm(compiler, {
        // methods: "GET",
        serverSideRender: true,
        writeToDisk: false
    }))
    app.use(wphm(compiler, {
        path: '/__hmr'
    }))
}

let wsInstance = ews(app, server)

// Create endpoint to get User info
wsRouter.ws("/data", (ws, req) => {
    ws.on("message", d => handleWSMsg(d, req))
    
    //@ts-ignore
    ws.alive = true
    //@ts-ignore
    ws.on('pong', () => ws.alive = true)
    // if (req.session[ "user" ]) {
    //     res.send(apiResonse(true, "Signed In", { user: req.session[ "user" ] }))
    // } else {
    //     res.send(apiResonse(false, "Not Signed in"))
    // }
})

let handleWSMsg = (rawData: import("ws").RawData, req: express.Request) => {
    let data: import("../../dataTypes").server
    
    // let return: 
}
// Create Login Flow
app.get(config.AuthUrl, async (req, res, next) => {
    // if (fs.existsSync(path.resolve("..", "data.json"))) {
    //     if (req.ip.includes("127.0.0.1") || req.ip.includes("::") || req.ip.includes("::ffff")) {
    //         let user_data: import("../types").UserLogin = JSON.parse(fs.readFileSync(path.resolve("..", "data.json"), { encoding: 'utf-8' }))
    //         if (dayjs(user_data.expire_time).toDate().getTime() >= dayjs().toDate().getTime()) {
    //             // Implement Refresh Token
    //             let data: { access_token: string, expires_in: number, refresh_token: string, scope: string, token_type: string/* "Bearer" */ } = await (await fetch("https://discord.com/api/oauth2/token", {
    //                 method: "POST",
    //                 body: new url.URLSearchParams({
    //                     client_id: config.ClientId,
    //                     client_secret: client_secret,
    //                     grant_type: "refresh_token",
    //                     refresh_token: user_data.refresh_token
    //                 }),
    //                 headers: {
    //                     "Content-Type": "application/x-www-form-urlencoded"
    //                 }
    //             })).json()
    //             let expire = dayjs().add(data.expires_in - 24 * 60 * 60, "s").format()
    //             // fs.writeFileSync(path.resolve("..", "data.json"), JSON.stringify({ ...data, expire_time: expire }))
    //             user_data = { ...data, expire_time: expire }

    //         }
    //         req.session[ "user_data" ] = user_data
    //         let user: import("../types").User = (await (await fetch("https://discord.com/api/users/@me", {
    //             headers: {
    //                 authorization: `${user_data.token_type} ${user_data.access_token}`
    //             }
    //         })).json())

    //         console.log(user)

    //         req.session[ "user" ] = { name: `${user.username}#${user.discriminator}`, id: user.id }

    //         next()

    //         let guilds: import("../types").Guild[] = (await (await fetch("https://discord.com/api/users/@me/guilds", {
    //             headers: {
    //                 authorization: `${user_data.token_type} ${user_data.access_token}`
    //             }
    //         })).json())

    //         let guilds_obj: import("../types").UserGuild[] = []
    //         for (let guild of guilds) {
    //             //@ts-ignore
    //             let permissions: import("../types").GuildPermissions = parsePermissions(parseInt(guild.permissions))
    //             guilds_obj.push({ id: guild.id, name: guild.name, permission: permissions, icon: `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.webp` })
    //         }

    //         store.get(req.sessionID, (err, sess) => {
    //             if (!err) {
    //                 sess[ "user" ].guilds = guilds_obj
    //                 store.set(req.sessionID, sess)
    //             }
    //         })
    //         return;
    //     }
    // }
    let cjMessage = '<p>You might have been <a href="https://en.wikipedia.org/wiki/Clickjacking">clickjacked</a>. Try logining in at another time or try one of <a href="https://en.wikipedia.org/wiki/Clickjacking#Prevention">these</a> options.</p>'
    let loginInfo: { state: string, iv: string, key: string, auth_tag: string } = req.session[ "login" ]
    if (loginInfo && req.query.code) {
        console.log(req.query, loginInfo)
        let loginState: string
        try {
            loginState = crypto.decrypt({ tag: loginInfo.auth_tag, ciphertext: req.query.state.toString(), iv: loginInfo.iv, key: loginInfo.key })
        } catch (err) {
            res.status(401).send(cjMessage)
            console.log(err, req.query.state)
            return;
        }
        
        console.log(1, loginState, loginInfo)
        if (loginInfo.state != loginState) {
            res.status(401).send(cjMessage)
            return
        }
        try {
            let redirect_uri = new url.URLSearchParams(config.AuthUrl.replace(/[A-z0-9:/]+\?/, "?")).get("redirect_uri")//querystring.parse(config.auth_url.replace("https://discord.com/api/oauth2/authorize?", "")).redirect_uri
            let expire = dayjs()
            let user_token: { access_token: string, expires_in: number, refresh_token: string, scope: string, token_type: string/* "Bearer" */ } = await (await fetch("https://discord.com/api/oauth2/token", {
                method: "POST",
                body: new url.URLSearchParams({
                    client_id: config.ClientId,
                    client_secret,
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
            expire.add(user_token.expires_in - 30, "s")
            // fs.writeFileSync(path.resolve("..", "data.json"), JSON.stringify({ ...user_data, expire_time: expire.format() }))

            // req.session[ "user_data" ] = user_data
            let user: import("../types").User = await (await fetch("https://discord.com/api/users/@me", {
                headers: {
                    Authorization: `${user_token.token_type} ${user_token.access_token}`
                }
            })).json()

            req.session.user_data = {
                avatar: user.avatar,
                id: user.id,
                name: user.username,
            }

            let [dbUser] = await db.user_logins.findOrCreate({ where: { id: user.id }})
            dbUser.access_token = user_token.access_token
            dbUser.refresh_token = user_token.refresh_token
            dbUser.scope = user_token.scope
            dbUser.token_type = user_token.token_type
            dbUser.expire_time = expire.toISOString()
            dbUser.save()

            console.log(user)

            req.session[ "user" ] = { name: user.username, id: user.id }

            let id = uuid.v1({
                msecs: dayjs().subtract(109, "milliseconds").toDate(),
                nsecs: random.num(random.singleNum(4, 0), 9)
            })
            
            fs.writeFileSync(path.resolve("web_data", "cookie_session.json"), JSON.stringify({c: req.cookies, sc: req.signedCookies, s: req.session, sec: req.session.cookie}), { encoding: "utf-8" })
            next()

            let guilds: import("../types").Guild[] = (await (await fetch("https://discord.com/api/users/@me/guilds", {
                headers: {
                    Authorization: `${user_token.token_type} ${user_token.access_token}`
                }
            })).json())

            let guilds_obj: import("../types").UserGuild[] = []
            for (let guild of guilds) {
                console.log("Checking", guild.id, `(${guild.name})`, guild.owner)
                //@ts-ignore
                let permissions: import("../types").GuildPermissions = parsePermissions(parseInt(guild.permissions))
                guilds_obj.push({ id: guild.id, name: guild.name, permission: permissions, icon: `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.webp` })
            }

            console.log(guilds_obj)

            // res.send("<p>Sucess</p>")
        } catch (err) {
            console.error(err)
            res.send('<p>Login failed, please try again later.</p>')
        }
    
    }
})

app.get([ "/guilds", "/guilds/get", "/guilds/refresh" ], async (req, res) => {
    let user: { name: string, id: string, guilds: import("../types").UserGuild[] }
    if (req.path.includes("refresh")) {
        if (req.session.user_data) {
            let user_data = await db.user_logins.findOne({ where: { id: req.session.user_data.id }})
            let guilds: import("../types").Guild[] = (await (await fetch("https://discord.com/api/users/@me/guilds", {
                headers: {
                    Authorization: `${user_data.token_type} ${user_data.access_token}`
                }
            })).json())

            let guilds_obj: import("../types").UserGuild[] = []
            for (let guild of guilds) {
                //@ts-ignore
                let permissions: import("../types").GuildPermissions = parsePermissions(parseInt(guild.permissions))
                guilds_obj.push({ id: guild.id, name: guild.name, permission: permissions, icon: `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.webp` })
            }

            // store.get(req.sessionID, (err, sess) => {
            //     if (!err) {
            //         sess[ "user" ].guilds = guilds_obj
            //         store.set(req.sessionID, sess)
            //     }
            // })
            return;
        } else {
            // res.send(apiResonse(false, "Not Signed In"))
        }
    } else if (req.session[ "user" ]) {
        // res.send(apiResonse(true, "Success", user.guilds))
    } else {
        // res.send(apiResonse(false, "Not Signed In"))
    }
})

app.get("/getLogin", async (req, res) => {
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

app.use("/ws", wsRouter)

app.use(express.static(path.resolve(__dirname, "static"), { dotfiles: "ignore", extensions: [], index: false, immutable: !isDev }))

let layout: string

app.get("*", (req, res) => {
    if (isDev) {
        let wpmw: import('webpack-dev-middleware').Context<import('http').IncomingMessage, import('http').ServerResponse & import("webpack-dev-middleware").ExtendedServerResponse> = res.locals.webpack.devMiddleware

        wpmw.outputFileSystem.readdir(path.join(wpmw.stats.toJson().outputPath), (err) => {
            if (err) {
                return res.status(502).end()
            }

            // Should not get to this if in static or memoryfs
            if (req.path.match(/\..+$/)) {
                return res.status(404).end()
            }

            try {
                res.send(wpmw.outputFileSystem.readFileSync(path.join(wpmw.stats.toJson().outputPath, "index.html"), { encoding: 'utf-8' }))
            } catch {
                res.status(502).send("Internal Error")
            }
            // res.send("Hello World")
        })
        return;
    }
    if (req.path.match(/\..+$/)) {
        return res.status(404).end()
    }
    if (layout == null) {
        layout = fs.readFileSync(path.resolve("./static/index.html"), { encoding: 'utf-8' })
    }
    res.send(layout)
})

if (!isDev) {
    app.use((err, req, res, next) => {
        if (err) {
            console.log(err)
            res.status(500).send("An error has occured within the application")
        } else {
            next()
        }
    })
}

let stop = async () => {
    server.close()
    sequelize_session.close()
    await store_obj?.sync()
    await store_obj?.stopExpiringSessions()

}


export = {
    start,
    stop
}
