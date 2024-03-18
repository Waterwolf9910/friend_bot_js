import types from "main/types"
import dtypes from "discord-api-types/v10"

let from =(path: string, _value: types.jsonable): types.jsonable => {
    if (/Activities\.Item [0-9+]\.type/.test(path)) {
        return dtypes.ActivityType[_value as number]
    }
    return _value
}

let to = (path: string, _value: types.jsonable): types.jsonable => {
    if (/Activities\.Item [0-9+]\.type/.test(path)) {
        return dtypes.ActivityType[_value as number]
    }
    return _value
}

export default {
    from,
    to
}

// export = from
