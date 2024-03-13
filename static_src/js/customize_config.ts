import types = require("main/types")
import dtypes = require("discord-api-types/v10")

let from = <T extends keyof types.Config>(key: T, _value: types.jsonable): types.jsonable => {
    if (key == "Activities") {
        let value = <import('discord.js').ActivityOptions[]> _value
        return value.map(v => ({
            ...v,
            type: dtypes.ActivityType[v.type!]
        }))
    }
    return _value
}

let to = (path: string, _value: types.jsonable): types.jsonable => {
    if (/Activities\.Item [0-9+]\.type/.test(path)) {
        return dtypes.ActivityType[_value as number]
    }
    return _value
}

export = {
    from,
    to
}
