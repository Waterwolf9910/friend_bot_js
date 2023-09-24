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
import morgan = require("morgan")
import errorhandler = require("errorhandler")
import compression = require("compression")
import url = require("url")
import mime = require("mime")
import crypto = require("../libs/crypto")
import _random = require("../libs/random")
import db = require("../libs/db")
import guild_queues = require("../commands/music/queues")

let app = express()
let wsRouter = express.Router()
let server: http.Server = http.createServer({}, app)
let sequelize_session: typeof _sequelize.Sequelize.prototype
let sequelize_store = _sequelize_store(session.Store)
let store_obj: InstanceType<ReturnType<typeof _sequelize_store>>
let isDev = process.env.NODE_ENV == "development"
let random = new _random(512, 9)

app.set('x-powered-by', false)

/** Converts a Guild Permission bit to an object
 * @param permissions The permission bit
 * @returns The permissions converted to an object
 */
let parsePermissions = (permissions: bigint) => {
    let result: import("../types").GuildPermissions = {
        create_instant_invite: (permissions & 1n << 0n) == 1n << 0n,
        kick_members: (permissions & 1n << 1n) == 1n << 1n,
        ban_members: (permissions & 1n << 2n) == 1n << 2n,
        administrator: (permissions & 1n << 3n) == 1n << 3n,
        manage_channels: (permissions & 1n << 4n) == 1n << 4n,
        manage_guild: (permissions & 1n << 5n) == 1n << 5n,
        add_reactions: (permissions & 1n << 6n) == 1n << 6n,
        view_audit_log: (permissions & 1n << 7n) == 1n << 7n,
        priority_speaker: (permissions & 1n << 8n) == 1n << 8n,
        stream: (permissions & 1n << 9n) == 1n << 9n,
        view_channel: (permissions & 1n << 10n) == 1n << 10n,
        send_messages: (permissions & 1n << 11n) == 1n << 11n,
        send_tts_messages: (permissions & 1n << 12n) == 1n << 12n,
        manage_messages: (permissions & 1n << 13n) == 1n << 13n,
        embed_links: (permissions & 1n << 14n) == 1n << 14n,
        attach_files: (permissions & 1n << 15n) == 1n << 15n,
        read_message_history: (permissions & 1n << 16n) == 1n << 16n,
        mentions_everyone: (permissions & 1n << 17n) == 1n << 17n,
        use_external_emojis: (permissions & 1n << 18n) == 1n << 18n,
        view_guild_insights: (permissions & 1n << 19n) == 1n << 19n,
        connect: (permissions & 1n << 20n) == 1n << 20n,
        speak: (permissions & 1n << 21n) == 1n << 21n,
        mute_members: (permissions & 1n << 22n) == 1n << 22n,
        deafen_members: (permissions & 1n << 23n) == 1n << 23n,
        move_members: (permissions & 1n << 24n) == 1n << 24n,
        use_vad: (permissions & 1n << 25n) == 1n << 25n,
        change_nickname: (permissions & 1n << 26n) == 1n << 26n,
        manage_nicknames: (permissions & 1n << 27n) == 1n << 27n,
        manage_roles: (permissions & 1n << 28n) == 1n << 28n,
        manage_webhooks: (permissions & 1n << 29n) == 1n << 29n,
        manage_emojis_and_stickers: (permissions & 1n << 30n) == 1n << 30n,
        use_application_commands: (permissions & 1n << 31n) == 1n << 31n,
        request_to_speak: (permissions & 1n << 32n) == 1n << 32n,
        manage_events: (permissions & 1n << 33n) == 1n << 33n,
        manage_threads: (permissions & 1n << 34n) == 1n << 34n,
        create_public_threads: (permissions & 1n << 35n) == 1n << 35n,
        create_private_threads: (permissions & 1n << 36n) == 1n << 36n,
        use_external_stickers: (permissions & 1n << 37n) == 1n << 37n,
        send_messages_in_thread: (permissions & 1n << 38n) == 1n << 38n,
        use_embedded_activites: (permissions & 1n << 39n) == 1n << 39n,
        moderate_members: (permissions & 1n << 40n) == 1n << 40n
    }

    return result;
}

/**
 * Gets the removed part of the uri from origin server (i.e what is put in the location directive for nginx)
 * @param recievedPath The path got from req.path
 * @param root_path Path sent from origin server (i.e $uri from nginx)
 * @returns Returns the path directed from the origin server 
 */
let getTrueRootURLPath = (recievedPath: string, root_path: string | string[]): string => {
    let _root_path = Array.isArray(root_path) ? root_path[0] : root_path
    let relative_path = path.posix.relative(recievedPath, '/').replace(/^\.\.\//, recievedPath.endsWith('/') ? '../' : './') || './'
    let formatted = path.posix.normalize(_root_path + '/' + relative_path).replace(/\/$/, '')
    console.log( relative_path, formatted)
    return formatted
}

let start = async (secret: string, client_secret: string, config: import("../types").Config, client: import("discord.js").Client<true>) => {
    sequelize_session = new _sequelize.Sequelize({ database: "Friend_Bot", username: "friend_bot", password: secret, dialect: "sqlite", logging: (a) => {
        fs.appendFileSync(path.resolve("web_data", "session.log"), `[Sequelize] session-store: ${a}`)
    }, pool: {acquire: 40000}, storage: "./web_data/session.db" })
    store_obj = new sequelize_store({ db: sequelize_session, checkExpirationInterval: 1000 * 60 * 10, expiration: 1000 * 60 * 60 * 24 * 7 * 2, tableName: "sessions", })
    await sequelize_session.sync()
    store_obj.sync()

    app.set("trust proxy", config.ReverseProxy !== "" ? 1 : 0)

    app.use(session({
        secret: secret,
        store: store_obj,
        rolling: true,
        name: "sessionId",
        cookie: {
            httpOnly: true,
            secure: config.UseHttps,
            maxAge: (1000 * 60 * 60 * (isDev ? 12 : 6)) - (1000 * 60),
            sameSite: "lax",
            signed: config.UseHttps
        },
        resave: false,
        saveUninitialized: false,
        unset: "destroy"
    }))


    app.use(helmet.default({
        hsts: !isDev,
        crossOriginEmbedderPolicy: {
            policy: "credentialless"
        },
        contentSecurityPolicy: {
            useDefaults: true,
            directives: {
                "default-src": [ "'self'" ],
                "script-src": [ "'self'", isDev && "'unsafe-eval'" ].filter(v => typeof v != "boolean"),
                "style-src": [ "'self'", "https://fonts.googleapis.com" ],
                "img-src": [ "'self'", "https://cdn.discordapp.com" ]
            }
        },
        hidePoweredBy: true,
        noSniff: true
    }))
    app.use(cors({
        origin: true,
        credentials: false
    }))
    app.use(errorhandler({
        log: (err, str, req) => {
            fs.appendFileSync(path.resolve("web_data", "error.log"), `Error at ${req.url} (${req.method} request)\n${str}\n${err}`)
        }
    }))
    app.use(morgan("combined", { stream: fs.createWriteStream(path.resolve("web_data", "access.log")) }))
    fs.mkdirSync("web_data", { recursive: true })
    fs.writeFileSync(path.resolve("web_data", "access.log"), '', { encoding: 'utf-8' })

    if (!isDev) {
        app.use(compression())
    } else {
        app.use(morgan("dev"))
        let webpack: typeof import("webpack") = require("webpack")
        let wpdm: typeof import("webpack-dev-middleware") = require("webpack-dev-middleware")
        let wphm: typeof import("webpack-hot-middleware") = require("webpack-hot-middleware")
        let wpconfig: import("webpack").Configuration = require("../../webpack.config")
        let compiler = webpack(wpconfig)
        app.use(wpdm(compiler, {
            // methods: "GET",
            index: false,
            serverSideRender: true,
            writeToDisk: false
        }))
        app.use(wphm(compiler, {
            path: '/__hmr'
        }))
    }

    setupRoutes(config, client_secret, client)
    
    if (config.CloseOnUsedPort) {
        server.listen(config.HttpPort, () => {
            console.log(`Listening on port ${config.HttpPort}`)
        })
    } else {
        try {
            server.listen(config.HttpPort, () => {
                console.log(`Listening on port ${config.HttpPort}`)
            })
        } catch {}
    }
}

app.set("json spaces", 4)

// Setup all of the routes to be effected after stuff like session
let setupRoutes = (config: import("../types").Config, client_secret: string, client: import("discord.js").Client<true>) => {
    app.use("/ws", wsRouter)

    // Create Login Flow
    app.use(path.posix.normalize(`/${config.AuthUrl}`), async (req, res, next) => {
        let root_path = config.ReverseProxy ? req.headers[ 'x-original-url' ] || req.path : req.path
        let cjMessage = '<p>You might have been <a href="https://en.wikipedia.org/wiki/Clickjacking">clickjacked</a>. Try logining in at another time or try one of <a href="https://en.wikipedia.org/wiki/Clickjacking#Prevention">these</a> options.</p>'
        let loginInfo: { state: string, iv: string, key: string, auth_tag: string } = req.session[ "login" ]
        // If there was no state or code stop the operation early
        if (!loginInfo || !req.query.code) {
            return res.status(401).send("Internal Error")
        }
        let loginState: string
        // Try to decrypt the state. if this fails, then the request has been messed with
        try {
            loginState = crypto.decrypt({ tag: loginInfo.auth_tag, ciphertext: req.query.state.toString(), iv: loginInfo.iv, key: loginInfo.key })
        } catch (err) {
            res.status(401).send(cjMessage)
            console.error(err, req.query.state)
            return;
        }
        
        // Once again the state is not valid so stop the attempt early
        if (loginInfo.state != loginState) {
            res.status(401).send(cjMessage)
            return
        }
        try {
            
            // Get current date for expiration time the grap our token from discord
            let expire = dayjs()
            let _user_token: { error: undefined, error_description: undefined, access_token: string, expires_in: number, refresh_token: string, scope: string, token_type: string/* "Bearer" */ } | {error: string, error_description: string} = await (await fetch("https://discord.com/api/oauth2/token", {
                method: "POST",
                body: new url.URLSearchParams({
                    client_id: config.ClientId,
                    client_secret,
                    code: req.query.code.toString(),
                    grant_type: "authorization_code",
                    // Recalculate the redirect uri
                    redirect_uri: url.format({
                        protocol: config.UseHttps ? "https" : "http",
                        host: req.headers.host,
                        pathname: path.posix.normalize(`/${getTrueRootURLPath(req.path, root_path)}`)
                    }),
                    scope: "identify guilds guilds.members.read"
                }),
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            })).json()
            
            if (_user_token.error) {
                throw _user_token.error_description;
            }

            //@ts-ignore
            let user_token: { error: undefined, error_description: undefined, access_token: string, expires_in: number, refresh_token: string, scope: string, token_type: string/* "Bearer" */ } = _user_token
            // console.log(config.client_id, config.client_secret)
            expire.add(user_token.expires_in - 30, "s")
            // fs.writeFileSync(path.resolve("..", "data.json"), JSON.stringify({ ...user_data, expire_time: expire.format() }))

            // Get the user data from discord
            let user: import("../types").User = await (await fetch("https://discord.com/api/users/@me", {
                headers: {
                    Authorization: `${user_token.token_type} ${user_token.access_token}`
                }
            })).json()
            
            // Write the user info to the database
            let [dbUser] = await db.user_logins.findOrCreate({ where: { id: user.id }})
            dbUser.access_token = user_token.access_token
            dbUser.refresh_token = user_token.refresh_token
            dbUser.scope = user_token.scope
            dbUser.token_type = user_token.token_type
            dbUser.expire_time = expire.toISOString()
            dbUser.save()

            req.session.user_data = {
                avatar: user.avatar,
                id: user.id,
                selected_gid: '',
                name: user.username,
            }
            
            // Start fetching guilds
            let guilds: import("../types").Guild[] = (await (await fetch("https://discord.com/api/users/@me/guilds", {
                headers: {
                    Authorization: `${user_token.token_type} ${user_token.access_token}`
                }
            })).json())

            // Parse the guilds into our format
            let guilds_obj: { [ key: string ]: import('../../src/types').UserGuild } = {}
            for (let guild of guilds) {
                if (isDev) {
                    console.writeDebug("Checking", guild.id, `(${guild.name})`, guild.owner)
                }
                //@ts-ignore
                let permissions: import("../types").GuildPermissions = parsePermissions(BigInt(guild.permissions))
                guilds_obj[guild.id] = { id: guild.id, name: guild.name, permission: permissions, rawPermissions: `${guild.permissions}`, icon: `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.webp`, hasBot: client.guilds.cache.has(guild.id) }
            }

            // Write the guilds to the session
            req.session.guilds = guilds_obj

            if (isDev) {
                fs.writeFileSync(path.resolve("web_data", "cookie_session.json"), JSON.stringify({ c: req.cookies, sc: req.signedCookies, s: req.session, sec: req.session.cookie }, null, 4), { encoding: "utf-8" })
            }

            next()
            // res.send("<p>Sucess</p>")
        } catch (err) {
            console.error(err)
            res.status(500).send('<p>Login failed, please try again later.</p>')
        }
    })

    app.get("/getLogin", async (req, res) => {
        let root_path = config.ReverseProxy ? req.headers[ 'x-original-url' ] || req.path : req.path

        // Generate and encrypt a state to be sent
        let state = random.alphaNum(true, 25)
        let state_enc = crypto.encrypt(state, random.alphaNumSpecial(true, null, 256))
        // Attach the state to the session
        req.session.login = { state: state, iv: state_enc.iv, key: state_enc.key, auth_tag: state_enc.tag }
        // Manually save the session because we are redirecting
        req.session.save((err) => {
            if (err) {
                console.log(err)
                return res.redirect(500, "/500")
            }
            //TODO: Implement later using session
            // let _ruri = req.query["redirect_url"]
            // let ruri: string
            // if (_ruri instanceof Array) {
            //     ruri = _ruri[0].toString()
            // } else {
            //     ruri = _ruri.toString()
            // }
            // if (!ruri.startsWith("/")) {
            //     ruri = "/"
            // }
            // ruri = encodeURIComponent(ruri)
            let _host = req.headers.host.toLowerCase().split(":")
            let _port = parseInt(_host[ 1 ]);
            /**
             * Checks if
             * - hostname length is less than 1 or greater than 255
             * - The string was split into more than 2 or less than 1
             * - The hostname itself does not contain any invalid characters
             * - The port is a valid number and in the correct range
             */
            if (req.headers.host.length == 0 || req.headers.host.length > 255 || _host.length == 0 || _host.length > 2 || _host[0].match(/[^a-z0-9_\-.]+/) || (_host.length == 2 && (isNaN(_port) || _port > 65535 || _port < 1))) {
                return res.redirect(500, "/500")
            }
            let params = new url.URLSearchParams({
                response_type: "code",
                client_id: config.ClientId,
                scope: "identify guilds guilds.members.read",
                state: state_enc.ciphertext,
                redirect_uri: url.format({
                    protocol: config.UseHttps ? "https" : "http",
                    host: req.headers.host,
                    pathname: path.posix.normalize(`/${getTrueRootURLPath(req.path, root_path)}/${config.AuthUrl}`)
                }),
                prompt: "none"
            })
            // Redirect us to discord for login
            res.redirect(`https://discord.com/oauth2/authorize?${params.toString()}`)
        })
    })
    
    app.get("/logout", async (req, res, next) => {
        req.session.destroy((err) => {
            if (err) {
                console.error(err)
            }
            next()
        })
    })

    let handleWSMsg = async (rawData: import("ws").RawData, ws: import("ws").WebSocket, req: express.Request) => {
        let send_invalid = () => {
            if (isDev) {
                console.log("Recieved Invalid Input:", rawData.toString())
            }
            ws.send(JSON.stringify({
                type: "err",
                msg: {
                    err: "invalid_msg"
                }
            } satisfies import("../../websocket_proto").InvalidMessage))
        }

        let data: import("../../websocket_proto").server
        try {
            data = JSON.parse(rawData.toString('utf-8'))
        } catch {
            send_invalid()
            return;
        }

        if (!data.type || !data.msg) {
            send_invalid()
            return;
        }

        let returner: import("../../websocket_proto").client

        let setLoggedOut = () => {
            returner = {
                type: "err",
                msg: {
                    err: "not_logged_in"
                }
            }
        }

        switch (data.type) {
            case "request": {
                if (!req.session.user_data) {
                    setLoggedOut()
                    break;
                }
                switch (data.msg.type) {
                    case "user": {
                        returner = {
                            type: "user",
                            msg: {
                                ...req.session.user_data,
                                guilds: req.session.guilds
                            }
                        }
                        break;
                    }
                    case "voice": {
                        let _data = guild_queues.guild_queues[ (<import("../../websocket_proto").VoiceRequest>data).msg.guild_id]
                        returner = {
                            type: "voice",
                            msg: {
                                bot_in_channel: Boolean(_data?.vchannel),
                                id: _data.tchannel?.id,
                                in_channel: _data.vchannel.members.has(req.session.user_data.id)
                            }
                        }
                        break;
                    }
                    case "app_info": {
                        returner = {
                            type: "app_info",
                            msg: {
                                client_id: config.ClientId
                            }
                        }
                        break;
                    }
                    default: {
                        return send_invalid()
                    }
                }
                break;
            }
            case "set_gid": {
                if (!req.session.user_data) {
                    setLoggedOut()
                    break;
                }
                req.session.user_data.selected_gid = data.msg.gid
                break;

            }
            case "guild_refresh": {
                if (!req.session.user_data) {
                    setLoggedOut()
                    break;
                }
                let user_token = await db.user_logins.findOne({ where: {id: req.session.user_data.id} })
                let guilds: import("../types").Guild[] = (await(await fetch("https://discord.com/api/users/@me/guilds", {
                    headers: {
                        Authorization: `${user_token.token_type} ${user_token.access_token}`
                    }
                })).json())

                let guilds_obj: { [ key: string ]: import('../../src/types').UserGuild } = {}
                for (let guild of guilds) {
                    console.log("Checking", guild.id, `(${guild.name})`, guild.owner)
                    //@ts-ignore
                    let permissions: import("../types").GuildPermissions = parsePermissions(BigInt(guild.permissions))
                    guilds_obj[guild.id] = { id: guild.id, name: guild.name, permission: permissions, rawPermissions: `${guild.permissions}`, icon: `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.webp`, hasBot: client.guilds.cache.has(guild.id) }
                }

                req.session.guilds = guilds_obj
                break;
            }
            default: {
                returner = {
                    type: "err",
                    msg: {
                        err: "unknown_message"
                    }
                }
            }
        }

        // console.log(data, rawData)
        ws.send(JSON.stringify(returner))
    }

    let _static = express.static(path.resolve(__dirname, "static"), { dotfiles: "ignore", extensions: [], index: false, immutable: !isDev })
    app.use((req, res, next) => _static(req, res, next))

    let layout: string

    app.get('*', (req, res) => {
        // let _path = req.path.replace(new RegExp(`/?${config.ReverseProxy}/?`), '')
        //@ts-ignore
        let root_path = config.ReverseProxy ? req.headers['x-original-url'] || req.path : req.path
        if (isDev) {
            let wpmw: import('webpack-dev-middleware').Context<import('http').IncomingMessage, import('http').ServerResponse & import("webpack-dev-middleware").ExtendedServerResponse> = res.locals.webpack.devMiddleware
            if (!wpmw.state) {
                return res.status(500).send("<p>Not done loading</p>")
            }
            wpmw.outputFileSystem.readdir(path.join(wpmw.stats.toJson().outputPath), (err) => {
                if (err) {
                    return res.status(500).end()
                }

                // Should not get to this if in static or memoryfs
                if (path.basename(req.path).match(/^\..+/) || req.path.match(/\/\.\.?/)) {
                    return res.status(404).end()
                }

                if (req.path.includes("/outPath")) {
                    //@ts-ignore
                    return res.send(wpmw.outputFileSystem.readdirSync(wpmw.stats.toJson().outputPath))
                }
                wpmw.outputFileSystem.readFile(path.resolve(wpmw.stats.toJson().outputPath, path.normalize(`./${req.path}`)), (err2, data) => {
                    if (!err2) {
                        let type = mime.getType(path.extname(req.path))
                        if (type) {
                            res.setHeader("Content-Type", type)
                        }

                        return res.send(data)
                    }

                    if (path.basename(req.path).match(/^([^./\\*"<>:|? ]+)(\.[^/\\*"<>:|?.]+)+$/)) {
                        return res.status(404).end()
                    }
                    try {
                        let _layout = wpmw.outputFileSystem.readFileSync(path.join(wpmw.stats.toJson().outputPath, "index.html"), { encoding: 'utf-8' })
                        console.log(req.headers[ 'x-original-url' ])
                        res.send(_layout.replace("&{_path_}", getTrueRootURLPath(req.path, root_path)))
                    } catch {
                        res.status(500).send("Internal Error")
                    }
                })
                // res.send("Hello World")
            })
            return;
        }

        if (path.basename(req.path).match(/^\..+/) || req.path.match(/\/\.\.?/)) {
            return res.status(404).end()
        }

        if (layout == null) {
            layout = fs.readFileSync(path.resolve("./static/index.html"), { encoding: 'utf-8' })
        }

        if (fs.existsSync(path.normalize(`./static/${req.path}`))){
            return res.send(path.normalize(`./static/${req.path}`))
        } else if (!path.basename(req.path).match(/^([^./\\*"<>:|? ]+)(\.[^/\\*"<>:|?.]+)+$/)) {
            return res.status(404).end()
        }

        res.send(layout)
    })

    app.use(express.urlencoded({ extended: true, inflate: true }))
    app.use(express.text({ type: "application/json", inflate: true }))
    app.use(express.text({ type: "text/plain", inflate: true }))

    // Check and disconnect clients that are not pinging back
    setInterval(async () => {
        for (let client of wsInstance.getWss().clients) {

            //@ts-ignore
            if (!client.alive) {
                client.terminate()
                continue
            }

            //@ts-ignore
            client.alive = false
            client.ping()
        }
    }, 30000)

    let wsInstance: ews.Instance = ews(app, server)

    wsRouter.ws("/data", (ws, req) => {
        ws.on("message", d => handleWSMsg(d, ws, req))

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

    if (!isDev) {
        app.use((err, req, res, next) => {
            if (err) {
                console.log(err)
                res.redirect(500, "/505")
            } else {
                next()
            }
        })
    }
}

if (isDev) {
    app.get("/stop", (_, r) => {
        r.send("Done")
        stop()
        process.exit(0)
    })
}

let stop = () => {
    try {
        server.close()
    } catch {}
    sequelize_session?.close()
    store_obj?.sync()
    store_obj?.stopExpiringSessions()
}

export = {
    start,
    stop
}
