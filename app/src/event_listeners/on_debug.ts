import fs = require('fs')
import path = require('path')
let _: import("main/types").event<"debug"> = {
    name: "debug",
    function: (_config, _client, msg) => {
        fs.appendFileSync(path.resolve("debug_bot.log"), `${msg}\n`);
    }
}

export = _
