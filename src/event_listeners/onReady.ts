
let _: import('../types').event<"ready"> = {
    name: "ready",
    function: (_config, _client, a) => {
        console.log(`Bot Connected to ${a.user.username}#${a.user.discriminator}`)
    }
}

export = _
