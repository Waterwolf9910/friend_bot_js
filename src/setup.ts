import path = require("path")
import fs = require("fs")
import discord = require("discord.js")
let isDev = process.env.NODE_ENV == "development"

import _random = require("wolf_utils/random.js")
let random = _random.createRandom(256, 9)

let baseConfig: import("./types").Config = {
    Activities: [
        {
            name: "Games with friends",
            type: discord.ActivityType.Playing
        },
        {
            name: "YT with Friends",
            type: discord.ActivityType.Watching,
            url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        }
    ],
    AuthUrl: "/login",
    BaseCurrencyName: "cookies",
    BotOwner: "331854425171951616",
    BotToken: "",
    ClientId: "",
    ClientSecret: "",
    CloseOnUsedPort: false,
    DBFile: path.resolve("data.sqlite"),
    DBHost: "localhost",
    DBName: "Friend Bot",
    DBPassword: "pass@friend_bot",
    DBPort: 3306,
    DBType: "sqlite",
    DBUser: "friend_bot",
    DBUseSSL: false,
    DisabledPlugins: [],
    HttpPort: isDev ? 8080 : 3000,
    UseHttps: true,
    UseServer: true,
    RefreshDays: 90,
    ReverseProxy: "",
    Status: "idle",
    WebDomain: `localhost:${isDev ? 3000 : 8080}`,
    WebSecret: random.alphaNum(true),
} satisfies import("./types").Config

fs.writeFileSync(path.resolve("config.json"), JSON.stringify({ ...(fs.existsSync(path.resolve("config.json")) ? baseConfig : {}), ...JSON.parse(fs.readFileSync(path.resolve("config.json"), { encoding: 'utf-8' })) }, null, 4))

if (!fs.existsSync(path.resolve("plugins"))) {
    fs.mkdirSync(path.resolve("plugins"))
    // console.log("Write scripts in plugins to be used with the bot! (see example.js to see how to create your own)")
}
