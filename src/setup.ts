import path = require("path")
import fs = require("fs")
let mdir = fs.mkdirSync
let wfs = fs.writeFileSync
let es = fs.existsSync

//@ts-ignore
fs.mkdirSync = (_path: fs.PathLike, options?: fs.MakeDirectoryOptions & { recursive: boolean }) => {
    if (typeof _path != "string") {
        return mdir(_path, options)
    }
    if (_path.includes(path.normalize("/node_modules/ytsr/dumps"))) {
        return null;
    }
    return mdir(_path, options)
}
fs.writeFileSync = (_path: fs.PathOrFileDescriptor, data: string | NodeJS.ArrayBufferView, options?: fs.WriteFileOptions) => {
    if (typeof _path != "string") {
        return wfs(_path, data, options)
    }
    if (_path.includes(path.normalize("/node_modules/ytsr/dumps"))) {
        return null;
    }
    return wfs(_path, data, options)
}
fs.existsSync = (_path: string) => {
    if (typeof _path != "string") {
        return es(_path)
    }
    if (_path. includes(path.normalize("/node_modules/ytsr/dumps"))) {
        return true;
    }
    return es(_path)
}
import _random = require("./libs/random")
let random = new _random(256, 9)

let baseConfig: import("./types").Config = {
    Activities: [
        {
            name: "Games with friends",
            //@ts-ignore
            activity: "PLAYING"
        },
        {
            name: "YT with Friends",
            //@ts-ignore
            activity: "WATCHING",
            url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        }
    ],
    AuthUrl: "/login",
    BaseCurrencyName: "cookies",
    BotOwner: "331854425171951616",
    BotToken: "",
    Cert: path.resolve("web_data", "cert.pem"),
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
    DHParam: path.resolve("web_data", "dhparam.pem"),
    DisabledPlugins: [],
    HttpPort: 8080,
    HttpsPort: 3000,
    UseHttps: true,
    Prefix: "f!",
    Privkey: path.resolve("web_data", "key.pem"),
    RefreshDays: 90,
    ReverseProxy: "",
    Status: "idle",
    WebSecret: random.alphaNum(true),
}

if (fs.existsSync(path.resolve("config.json"))) {
    fs.writeFileSync(path.resolve("config.json"), JSON.stringify({ ...baseConfig, ...JSON.parse(fs.readFileSync(path.resolve("config.json"), { encoding: 'utf-8' })) }, null, 4))

} else {
    fs.writeFileSync(path.resolve("config.json"), JSON.stringify(baseConfig, null, 4))
    console.log("Config Successfully Created")
}
if (!fs.existsSync(path.resolve("plugins"))) {
    fs.mkdirSync(path.resolve("plugins"))
    // console.log("Write scripts in plugins to be used with the bot! (see example.js to see how to create your own)")
}
