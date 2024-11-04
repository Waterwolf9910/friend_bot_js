
let _: import("main/types").event<"error"> = {
    name: "error",
    function: (_config, _client, msg) => {
        if (msg.message.includes("Client.destroy")) {
            return;
        }
        console.error("[discord.js]", msg)
    }
}

export = _
