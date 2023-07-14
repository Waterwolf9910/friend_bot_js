
let _: import("../types").event<"warn"> = {
    name: "warn",
    function: (_config, _client, msg) => {
        console.warn("[discord.js]", msg)
    },
}

export = _
